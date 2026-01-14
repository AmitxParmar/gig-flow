import { useEffect, createContext, useContext, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { socketClient } from '@/lib/socket'
import { useCurrentUser } from '@/hooks/useAuth'
import { SocketEvents, type NotificationPayload, type GigEventPayload } from '@/types/socket'
import { gigKeys } from '@/hooks/useGigs'
import { notificationKeys } from '@/hooks/useNotification'
import type { Notification } from '@/types/notification'
import type { Gig } from '@/types/gig'

interface SocketContextValue {
    isConnected: boolean
}

const SocketContext = createContext<SocketContextValue>({ isConnected: false })

export const useSocketContext = () => useContext(SocketContext)

interface SocketProviderProps {
    children: ReactNode
}

/**
 * SocketProvider establishes WebSocket connection when user is authenticated
 * and handles real-time updates by directly updating TanStack Query cache
 */
export function SocketProvider({ children }: SocketProviderProps) {
    const queryClient = useQueryClient()

    // Detect if we're on a public route (login/register)
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
    const isPublicRoute = pathname === '/' || pathname === '/register'

    // Only fetch user data on protected routes
    const { data: user } = useCurrentUser({ enabled: !isPublicRoute })

    useEffect(() => {
        // Only connect if user is authenticated
        if (!user) return

        // Connect socket - we use cookie-based auth, so no token needed in handshake
        // The server will read the JWT from cookies
        const socket = socketClient.connect('')

        // === Gig Event Handlers ===
        const handleGigCreated = (payload: GigEventPayload) => {
            console.log('Socket: Gig created', payload)
            // Invalidate gig lists to refetch (new gig needs full data)
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
        }

        const handleGigUpdated = (payload: GigEventPayload) => {
            console.log('Socket: Gig updated', payload)
            if (payload.gig) {
                // Directly update specific gig in cache
                queryClient.setQueryData<Gig>(
                    gigKeys.detail(payload.gigId),
                    payload.gig as Gig
                )
                // Update gig in list caches could be complex due to filters, so we invalidate
                queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
                queryClient.invalidateQueries({ queryKey: gigKeys.my })
            }
        }

        const handleGigDeleted = (payload: { gigId: string }) => {
            console.log('Socket: Gig deleted', payload)
            // Remove from detail cache
            queryClient.removeQueries({ queryKey: gigKeys.detail(payload.gigId) })
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
        }

        // === Notification Event Handlers ===
        const handleNotification = (notification: NotificationPayload) => {
            console.log('Socket: Notification received', notification)

            // Show toast notification
            toast(notification.message || 'New notification')

            // Add to notifications list cache
            queryClient.setQueryData<Notification[]>(
                notificationKeys.all,
                (oldNotifications) => {
                    if (!oldNotifications) return [notification as unknown as Notification]
                    // Prepend new notification to the list
                    return [notification as unknown as Notification, ...oldNotifications]
                }
            )

            // Increment unread count - store as plain number to match service type
            queryClient.setQueryData<number>(
                notificationKeys.unreadCount,
                (oldCount) => {
                    const newCount = (oldCount ?? 0) + 1
                    console.log('Socket: Updating unread count from', oldCount, 'to', newCount)
                    return newCount
                }
            )
        }

        // === Subscribe to Events ===
        const handleBidHired = (payload: { gigId: string }) => {
            console.log('Socket: Bid hired', payload)
            // Refetch gig and bids
            queryClient.invalidateQueries({ queryKey: gigKeys.detail(payload.gigId) })
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
            // Invalidate bids for this gig
            // Note: need to import bidKeys if not available, or just rely on invalidation
        }

        // === Subscribe to Events ===
        socket.on(SocketEvents.GIG_CREATED, handleGigCreated)
        socket.on(SocketEvents.GIG_UPDATED, handleGigUpdated)
        socket.on(SocketEvents.GIG_DELETED, handleGigDeleted)
        socket.on(SocketEvents.NOTIFICATION, handleNotification)
        socket.on(SocketEvents.BID_HIRED, handleBidHired) // Refetch on hiring

        // === Cleanup ===
        return () => {
            socket.off(SocketEvents.GIG_CREATED, handleGigCreated)
            socket.off(SocketEvents.GIG_UPDATED, handleGigUpdated)
            socket.off(SocketEvents.GIG_DELETED, handleGigDeleted)
            socket.off(SocketEvents.NOTIFICATION, handleNotification)
            socket.off(SocketEvents.BID_HIRED, handleBidHired)
        }
    }, [user, queryClient])

    const isConnected = socketClient.isConnected()

    return (
        <SocketContext.Provider value={{ isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
