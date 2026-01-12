import axios from 'axios'

// Dynamically construct API URL based on environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const ENV = import.meta.env.MODE === 'production' ? 'production' : 'development'
const API_URL = `${BASE_URL}/v1/${ENV}`

export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies (JWT tokens)
    headers: {
        'Content-Type': 'application/json',
    },
})

let isRefreshing = false
let refreshSubscribers: Array<(token?: string) => void> = []

const subscribeTokenRefresh = (cb: (token?: string) => void) => {
    refreshSubscribers.push(cb)
}

const onRefreshed = (token?: string) => {
    refreshSubscribers.forEach((cb) => cb(token))
    refreshSubscribers = []
}

// Redirect helper that works safely in client environment
const safeRedirect = (path: string) => {
    if (typeof window !== "undefined") {
        window.location.href = path
    }
}

// Response interceptor for handling errors and automatic token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response, config } = error
        const originalRequest = config

        // Network errors or no response
        if (!response) {
            return Promise.reject(error)
        }

        const errorCode = response.data?.code

        // 1. Handle Token Issues (Access Token) - Attempt refresh
        // This includes expired, invalid, AND missing access tokens
        // as long as the refresh token might still be valid
        const refreshableErrors = [
            "ACCESS_TOKEN_EXPIRED",
            "ACCESS_TOKEN_INVALID",
            "ACCESS_TOKEN_MISSING"
        ]

        // Skip token refresh for auth endpoints to prevent infinite loops
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/me') ||
            originalRequest.url?.includes('/auth/refresh')

        if (
            response.status === 401 &&
            refreshableErrors.includes(errorCode) &&
            !originalRequest._retry &&
            !isAuthEndpoint // Don't refresh on auth endpoint failures
        ) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(() => {
                        apiClient(originalRequest)
                            .then(resolve)
                            .catch(reject)
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // Perform refresh using a fresh axios instance to avoid interceptor loops
                // and break circular dependency with authService
                await axios.post(
                    `${API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                )

                // Refresh successful
                isRefreshing = false
                onRefreshed()

                // Retry the original request
                return apiClient(originalRequest)
            } catch (refreshError) {
                // Refresh failed
                isRefreshing = false
                refreshSubscribers = []
                safeRedirect("/")
                return Promise.reject(refreshError)
            }
        }

        // 2. Handle Critical Auth Errors (Force Logout)
        // These errors mean the refresh token is bad - no point trying to refresh
        const criticalAuthErrors = [
            "REFRESH_TOKEN_MISSING",
            "REFRESH_TOKEN_EXPIRED",
            "REFRESH_TOKEN_INVALID",
            "USER_NOT_FOUND"
        ]

        if (response.status === 401 && criticalAuthErrors.includes(errorCode)) {
            safeRedirect("/")
        }

        return Promise.reject(error)
    }
)
