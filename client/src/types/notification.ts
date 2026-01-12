
export enum NotificationType {
    TASK_ASSIGNED = 'TASK_ASSIGNED',
}

export interface Notification {
    id: string
    userId: string
    taskId: string
    type: NotificationType
    message: string
    isRead: boolean
    createdAt: string
    updatedAt: string
    task?: {
        title: string
    }
}

export interface NotificationCount {
    count: number
}
