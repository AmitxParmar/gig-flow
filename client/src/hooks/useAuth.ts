import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import type { RegisterDto, LoginDto } from '@/types/auth'

/**
 * Hook for registering a new user.
 * 
 * @returns A mutation object for user registration.
 */
export function useRegister() {
    return useMutation({
        mutationFn: (data: RegisterDto) => authService.register(data),
        onSuccess: (data) => {
            console.log('Registration successful:', data)
        },
        onError: (error: any) => {
            console.error('Registration failed:', error.response?.data || error.message)
        },
    })
}

/**
 * Hook for authenticating a user.
 * 
 * @returns A mutation object for user login.
 */
export function useLogin() {
    return useMutation({
        mutationFn: (data: LoginDto) => authService.login(data),
        onSuccess: () => {
            console.log('Login successful')
        },
        onError: (error: any) => {
            console.error('Login failed:', error.response?.data || error.message)
        },
    })
}

/**
 * Hook for logging out the current user session.
 * 
 * @returns A mutation object for user logout.
 */
export function useLogout() {
    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            console.log('Logout successful')
        },
        onError: (error: any) => {
            console.error('Logout failed:', error.response?.data || error.message)
        },
    })
}

/**
 * Hook for invalidating all active sessions for the current user.
 * 
 * @returns A mutation object for logging out from all devices.
 */
export function useLogoutAll() {
    return useMutation({
        mutationFn: () => authService.logoutAll(),
        onSuccess: () => {
            console.log('Logged out from all devices')
        },
        onError: (error: any) => {
            console.error('Logout all failed:', error.response?.data || error.message)
        },
    })
}

/**
 * Hook for refreshing the authentication tokens.
 * 
 * @returns A mutation object for token refresh.
 */
export function useRefreshToken() {
    return useMutation({
        mutationFn: () => authService.refresh(),
        onSuccess: () => {
            console.log('Token refreshed successfully')
        },
        onError: (error: any) => {
            console.error('Token refresh failed:', error.response?.data || error.message)
        },
    })
}

/**
 * Hook for retrieving the currently authenticated user's profile information.
 * 
 * @param options - Query options including enabled flag to conditionally fetch user
 * @returns A query object containing the current user data.
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authService.me(),
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: options?.enabled ?? true,
    })
}

/**
 * Hook for updating the current user's profile details.
 * Automatically invalidates the 'currentUser' query on success.
 * 
 * @returns A mutation object for updating user profile.
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: { name?: string; email?: string }) => authService.updateProfile(data),
        onSuccess: () => {
            console.log('Profile updated successfully')
            queryClient.invalidateQueries({ queryKey: ['currentUser'] })
        },
        onError: (error: any) => {
            console.error('Profile update failed:', error.response?.data || error.message)
        },
    })
}
