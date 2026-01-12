import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'

/**
 * Query keys for notification-related data.
 */
export const notificationKeys = {
    /** Key for fetching all notifications. */
    all: ['notifications'] as const,
    /** Key for fetching the count of unread notifications. */
    unreadCount: ['notifications', 'unread'] as const,
}
/**
 * Hook to fetch all notifications for the current user.
 * Refetches every 5 minutes as a fallback for real-time socket updates.
 * @returns The query result containing notifications.
 */
export function useNotifications() {
    return useQuery({
        queryKey: notificationKeys.all,
        queryFn: notificationService.getAll,
        refetchInterval: 1000 * 60 * 5, // 5 minutes is a recommended balance for real-time fallbacks
    })
}

/**
 * Hook to fetch the count of unread notifications.
 * Now updated in real-time via socket events (no polling needed).
 * @returns The query result containing the unread count.
 */
export function useUnreadCount() {
    return useQuery({
        queryKey: notificationKeys.unreadCount,
        queryFn: notificationService.getUnreadCount,
        staleTime: 5 * 60 * 1000, // 5 minutes - socket updates keep it fresh
    })
}

/**
 * Hook to mark a specific notification as read.
 * Invalidates notification lists and unread count on success.
 * @returns The mutation object for marking a notification as read.
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all })
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
        },
    })
}

/**
 * Hook to mark all notifications as read for the current user.
 * Invalidates notification lists and unread count on success.
 * @returns The mutation object for marking all notifications as read.
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all })
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
        },
    })
}
