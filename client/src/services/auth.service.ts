import { apiClient } from '@/lib/api-client'
import type { RegisterDto, LoginDto, AuthResponse, User } from '@/types/auth'
import type { ApiResponse } from '@/types/common.types'

/**
 * Auth Service - All authentication API calls
 * Routes match backend: /auth/*
 */
export const authService = {
    /**
     * POST /auth/register
     * Register a new user
     */
    register: async (data: RegisterDto): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
        return response.data.data
    },

    /**
     * POST /auth/login
     * Login user
     */
    login: async (data: LoginDto): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
        return response.data.data
    },

    /**
     * POST /auth/logout
     * Logout user (clears session and cookies)
     */
    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout')
    },

    /**
     * POST /auth/logout-all
     * Logout from all devices (requires auth)
     */
    logoutAll: async (): Promise<void> => {
        await apiClient.post('/auth/logout-all')
    },

    /**
     * POST /auth/refresh
     * Refresh access and refresh tokens
     */
    refresh: async (): Promise<void> => {
        await apiClient.post('/auth/refresh')
    },

    /**
     * GET /auth/me
     * Get current authenticated user (requires auth)
     */
    me: async (): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me')
        console.log("loggedin user", response.data)
        return response.data.data
    },

    /**
     * PATCH /auth/me
     * Update current user profile
     */
    updateProfile: async (data: { name?: string; email?: string }): Promise<User> => {
        const response = await apiClient.patch<ApiResponse<User>>('/auth/me', data)
        return response.data.data
    },
}
