import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketClient } from '@/lib/socket'
import { SocketEvents, type TaskEventPayload, type NotificationPayload } from '@/types/socket'
import { taskKeys } from './useTasks'
import type { Task } from '@/types/task'

/**
 * Hook to manage socket connection
 */
export function useSocket(token?: string) {
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (!token) return

        const socket = socketClient.connect(token)

        const handleConnect = () => setIsConnected(true)
        const handleDisconnect = () => setIsConnected(false)

        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)

        setIsConnected(socket.connected)

        return () => {
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
        }
    }, [token])

    const disconnect = useCallback(() => {
        socketClient.disconnect()
        setIsConnected(false)
    }, [])

    return {
        isConnected,
        disconnect,
        socket: socketClient.getSocket(),
    }
}

/**
 * Hook to listen to task events and update cache
 */
export function useTaskEvents() {
    const queryClient = useQueryClient()

    useEffect(() => {
        const socket = socketClient.getSocket()
        if (!socket) return

        // Handle task created
        const handleTaskCreated = (payload: TaskEventPayload) => {
            console.log('Task created event:', payload)
            // Invalidate task lists to refetch
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        }

        // Handle task updated
        const handleTaskUpdated = (payload: TaskEventPayload) => {
            console.log('Task updated event:', payload)
            if (payload.task) {
                // Update specific task in cache
                queryClient.setQueryData<Task>(
                    taskKeys.detail(payload.taskId),
                    payload.task as Task
                )
            }
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        }

        // Handle task deleted
        const handleTaskDeleted = (payload: { taskId: string }) => {
            console.log('Task deleted event:', payload)
            // Remove from cache
            queryClient.removeQueries({ queryKey: taskKeys.detail(payload.taskId) })
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        }

        socket.on(SocketEvents.TASK_CREATED, handleTaskCreated)
        socket.on(SocketEvents.TASK_UPDATED, handleTaskUpdated)
        socket.on(SocketEvents.TASK_DELETED, handleTaskDeleted)

        return () => {
            socket.off(SocketEvents.TASK_CREATED, handleTaskCreated)
            socket.off(SocketEvents.TASK_UPDATED, handleTaskUpdated)
            socket.off(SocketEvents.TASK_DELETED, handleTaskDeleted)
        }
    }, [queryClient])
}

/**
 * Hook to listen to task assignment events
 */
export function useTaskAssigned(onTaskAssigned?: (payload: TaskEventPayload) => void) {
    useEffect(() => {
        const socket = socketClient.getSocket()
        if (!socket) return

        const handleTaskAssigned = (payload: TaskEventPayload) => {
            console.log('Task assigned to you:', payload)
            onTaskAssigned?.(payload)
        }

        socket.on(SocketEvents.TASK_ASSIGNED, handleTaskAssigned)

        return () => {
            socket.off(SocketEvents.TASK_ASSIGNED, handleTaskAssigned)
        }
    }, [onTaskAssigned])
}

/**
 * Hook to listen to notifications
 */
export function useNotifications(onNotification?: (notification: NotificationPayload) => void) {
    const [notifications, setNotifications] = useState<NotificationPayload[]>([])

    useEffect(() => {
        const socket = socketClient.getSocket()
        if (!socket) return

        const handleNotification = (notification: NotificationPayload) => {
            console.log('Notification received:', notification)
            setNotifications((prev) => [notification, ...prev])
            onNotification?.(notification)
        }

        socket.on(SocketEvents.NOTIFICATION, handleNotification)

        return () => {
            socket.off(SocketEvents.NOTIFICATION, handleNotification)
        }
    }, [onNotification])

    const clearNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    return {
        notifications,
        clearNotifications,
        removeNotification,
    }
}

/**
 * Unified hook for socket connection and events
 * Automatically connects socket and listens to all task events
 * 
 * @example
 * const { isConnected, notifications } = useSocketConnection(token)
 */
export function useSocketConnection(token?: string) {
    const { isConnected, disconnect, socket } = useSocket(token)

    // Auto-setup task event listeners
    useTaskEvents()

    return {
        isConnected,
        disconnect,
        socket,
    }
}
