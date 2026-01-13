import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwtService from '@/lib/jwt';
import authRepository from '@/modules/auth/auth.repository';
import logger from '@/lib/logger';
import {
    SocketEvents,
    type AuthenticatedSocket,
    type NotificationPayload,
    type GigEventPayload,
    type BidEventPayload,
} from '@/types/socket.type';

class SocketService {
    private io: Server | null = null;
    private static instance: SocketService;

    /**
     * Gets the singleton instance of SocketService
     */
    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    /**
     * Initializes Socket.io with the HTTP server
     * @param httpServer - The HTTP server instance
     */
    public initialize(httpServer: HttpServer): Server {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                credentials: true,
            },
        });

        // Authentication middleware
        this.io.use(async (socket: AuthenticatedSocket, next) => {
            try {
                // Parse cookies from handshake headers
                const cookieHeader = socket.handshake.headers?.cookie || '';
                const cookies = this.parseCookies(cookieHeader);
                const token = cookies['access_token'] ||
                    socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.replace('Bearer ', '');

                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const payload = jwtService.verifyAccessToken(token);
                if (!payload) {
                    return next(new Error('Invalid or expired token'));
                }

                const user = await authRepository.findUserById(payload.userId);
                if (!user) {
                    return next(new Error('User not found'));
                }

                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });

        // Connection handler
        this.io.on(SocketEvents.CONNECTION, (socket: AuthenticatedSocket) => {
            this.handleConnection(socket);
        });

        logger.info('Socket.io initialized');
        return this.io;
    }

    /**
     * Handles new socket connections
     */
    private handleConnection(socket: AuthenticatedSocket): void {
        const userId = socket.user?.id;
        logger.info(`User connected: ${userId}`);

        // Join user's personal room for targeted notifications
        if (userId) {
            socket.join(`user:${userId}`);
        }

        // Handle room joining
        socket.on(SocketEvents.JOIN_ROOM, (room: string) => {
            socket.join(room);
            logger.info(`User ${userId} joined room: ${room}`);
        });

        // Handle room leaving
        socket.on(SocketEvents.LEAVE_ROOM, (room: string) => {
            socket.leave(room);
            logger.info(`User ${userId} left room: ${room}`);
        });

        // Handle disconnection
        socket.on(SocketEvents.DISCONNECT, () => {
            logger.info(`User disconnected: ${userId}`);
        });
    }

    /**
     * Parse cookie header string into key-value pairs
     */
    private parseCookies(cookieHeader: string): Record<string, string> {
        const cookies: Record<string, string> = {};
        if (!cookieHeader) return cookies;

        cookieHeader.split(';').forEach((cookie) => {
            const [name, ...rest] = cookie.split('=');
            if (name && rest.length > 0) {
                cookies[name.trim()] = rest.join('=').trim();
            }
        });
        return cookies;
    }

    /**
     * Gets the Socket.io server instance
     */
    public getIO(): Server | null {
        return this.io;
    }

    /**
     * Broadcasts a gig created event to all connected clients
     */
    public emitGigCreated(payload: GigEventPayload): void {
        if (!this.io) return;
        this.io.emit(SocketEvents.GIG_CREATED, payload);
        logger.info(`Emitted gig:created for gig ${payload.gigId}`);
    }

    /**
     * Broadcasts a gig updated event to all connected clients
     */
    public emitGigUpdated(payload: GigEventPayload): void {
        if (!this.io) return;
        this.io.emit(SocketEvents.GIG_UPDATED, payload);
        logger.info(`Emitted gig:updated for gig ${payload.gigId}`);
    }

    /**
     * Broadcasts a gig deleted event to all connected clients
     */
    public emitGigDeleted(gigId: string): void {
        if (!this.io) return;
        this.io.emit(SocketEvents.GIG_DELETED, { gigId });
        logger.info(`Emitted gig:deleted for gig ${gigId}`);
    }

    /**
     * Sends a notification to a specific user
     */
    public sendNotificationToUser(userId: string, notification: NotificationPayload): void {
        if (!this.io) return;
        this.io.to(`user:${userId}`).emit(SocketEvents.NOTIFICATION, notification);
        logger.info(`Sent notification to user ${userId}`);
    }

    /**
     * Notifies gig owner when a new bid is received
     */
    public notifyBidReceived(ownerId: string, payload: BidEventPayload): void {
        if (!this.io) return;
        this.io.to(`user:${ownerId}`).emit(SocketEvents.BID_RECEIVED, payload);
        logger.info(`Notified owner ${ownerId} of new bid on gig ${payload.gigId}`);
    }

    /**
     * Notifies freelancer when they are hired
     */
    public notifyBidHired(freelancerId: string, payload: BidEventPayload): void {
        if (!this.io) return;
        this.io.to(`user:${freelancerId}`).emit(SocketEvents.BID_HIRED, payload);
        logger.info(`Notified freelancer ${freelancerId} they were hired for gig ${payload.gigId}`);
    }

    /**
     * Notifies freelancer when their bid is rejected
     */
    public notifyBidRejected(freelancerId: string, payload: BidEventPayload): void {
        if (!this.io) return;
        this.io.to(`user:${freelancerId}`).emit(SocketEvents.BID_REJECTED, payload);
        logger.info(`Notified freelancer ${freelancerId} their bid was rejected for gig ${payload.gigId}`);
    }
}

export default SocketService.getInstance();
