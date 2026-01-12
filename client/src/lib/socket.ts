import { io, Socket } from 'socket.io-client'
import { SocketEvents } from '@/types/socket'

class SocketClient {
    private socket: Socket | null = null
    private static instance: SocketClient

    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient()
        }
        return SocketClient.instance
    }

    /**
     * Connect to Socket.io server with cookie-based JWT authentication
     */
    public connect(_token?: string): Socket {
        if (this.socket?.connected) {
            return this.socket
        }

        const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'

        this.socket = io(SOCKET_URL, {
            withCredentials: true, // Send cookies for JWT auth
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        })

        this.setupEventListeners()
        return this.socket
    }

    /**
     * Setup default event listeners
     */
    private setupEventListeners(): void {
        if (!this.socket) return

        this.socket.on(SocketEvents.CONNECTION, () => {
            console.log('Socket connected:', this.socket?.id)
        })

        this.socket.on(SocketEvents.DISCONNECT, (reason) => {
            console.log('Socket disconnected:', reason)
        })

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message)
        })

        this.socket.on('error', (error) => {
            console.error('Socket error:', error)
        })
    }

    /**
     * Disconnect from Socket.io server
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    /**
     * Get the socket instance
     */
    public getSocket(): Socket | null {
        return this.socket
    }

    /**
     * Check if socket is connected
     */
    public isConnected(): boolean {
        return this.socket?.connected || false
    }

    /**
     * Join a room
     */
    public joinRoom(room: string): void {
        if (this.socket?.connected) {
            this.socket.emit(SocketEvents.JOIN_ROOM, room)
        }
    }

    /**
     * Leave a room
     */
    public leaveRoom(room: string): void {
        if (this.socket?.connected) {
            this.socket.emit(SocketEvents.LEAVE_ROOM, room)
        }
    }
}

export const socketClient = SocketClient.getInstance()
