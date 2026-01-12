
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/common.types'
import type { Notification, NotificationCount } from '@/types/notification'



export const notificationService = {
    /**
     * Get all notifications for current user
     */
    getAll: async (): Promise<Notification[]> => {
        const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications')
        return response.data.data
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async (): Promise<number> => {
        const response = await apiClient.get<ApiResponse<NotificationCount>>('/notifications/unread-count')
        return response.data.data.count
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (id: string): Promise<Notification> => {
        const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`)
        return response.data.data
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<void> => {
        await apiClient.patch('/notifications/read-all')
    }
}
