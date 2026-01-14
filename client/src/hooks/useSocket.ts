import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketClient } from '@/lib/socket'
import { SocketEvents, type GigEventPayload, type NotificationPayload } from '@/types/socket'
import { gigKeys } from './useGigs'
import type { Gig } from '@/types/gig'

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
 * Hook to listen to gig events and update cache
 */
export function useGigEvents() {
    const queryClient = useQueryClient()

    useEffect(() => {
        const socket = socketClient.getSocket()
        if (!socket) return

        // Handle gig created
        const handleGigCreated = (payload: GigEventPayload) => {
            console.log('Gig created event:', payload)
            // Invalidate gig lists to refetch
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
        }

        // Handle gig updated
        const handleGigUpdated = (payload: GigEventPayload) => {
            console.log('Gig updated event:', payload)
            if (payload.gig) {
                // Update specific gig in cache
                queryClient.setQueryData<Gig>(
                    gigKeys.detail(payload.gigId),
                    payload.gig as Gig
                )
            }
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            // Invalidate My Gigs
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
        }

        // Handle gig deleted
        const handleGigDeleted = (payload: { gigId: string }) => {
            console.log('Gig deleted event:', payload)
            // Remove from cache
            queryClient.removeQueries({ queryKey: gigKeys.detail(payload.gigId) })
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
        }

        socket.on(SocketEvents.GIG_CREATED, handleGigCreated)
        socket.on(SocketEvents.GIG_UPDATED, handleGigUpdated)
        socket.on(SocketEvents.GIG_DELETED, handleGigDeleted)

        return () => {
            socket.off(SocketEvents.GIG_CREATED, handleGigCreated)
            socket.off(SocketEvents.GIG_UPDATED, handleGigUpdated)
            socket.off(SocketEvents.GIG_DELETED, handleGigDeleted)
        }
    }, [queryClient])
}

/**
 * Hook to listen to gig assignment (hiring) events
 */
export function useGigHired(onGigHired?: (payload: GigEventPayload) => void) {
    useEffect(() => {
        const socket = socketClient.getSocket()
        if (!socket) return

        const handleGigHired = (payload: GigEventPayload) => {
            console.log('Gig hired/assigned:', payload)
            onGigHired?.(payload)
        }

        // Using BID_HIRED as proxy for assignment if needed, though payload types match loosely
        socket.on(SocketEvents.BID_HIRED, handleGigHired)

        return () => {
            socket.off(SocketEvents.BID_HIRED, handleGigHired)
        }
    }, [onGigHired])
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
 * Automatically connects socket and listens to all gig events
 */
export function useSocketConnection(token?: string) {
    const { isConnected, disconnect, socket } = useSocket(token)

    // Auto-setup gig event listeners
    useGigEvents()

    return {
        isConnected,
        disconnect,
        socket,
    }
}
