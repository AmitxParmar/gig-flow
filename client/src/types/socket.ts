import type { Task } from './task'

// Socket Events enum matching backend
export enum SocketEvents {
    // Connection events
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',

    // Task events
    TASK_CREATED = 'task:created',
    TASK_UPDATED = 'task:updated',
    TASK_DELETED = 'task:deleted',

    // Notification events
    NOTIFICATION = 'notification',
    TASK_ASSIGNED = 'task:assigned',

    // Room events
    JOIN_ROOM = 'room:join',
    LEAVE_ROOM = 'room:leave',
}

// Task Event Payload
export interface TaskEventPayload {
    taskId: string
    task?: Task
    previousAssigneeId?: string
    newAssigneeId?: string
}

// Notification Payload
export interface NotificationPayload {
    id: string
    type: string
    message: string
    taskId?: string
    createdAt: Date
}
