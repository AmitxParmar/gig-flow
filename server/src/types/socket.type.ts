import { type Socket } from 'socket.io';
import { type SafeUser } from './auth.type';
import { type NotificationType } from '@prisma/client';

export interface AuthenticatedSocket extends Socket {
    user?: SafeUser;
}

export enum SocketEvents {
    // Connection events
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',

    // Gig events
    GIG_CREATED = 'gig:created',
    GIG_UPDATED = 'gig:updated',
    GIG_DELETED = 'gig:deleted',

    // Bid events
    BID_RECEIVED = 'bid:received',
    BID_HIRED = 'bid:hired',
    BID_REJECTED = 'bid:rejected',

    // Notification events
    NOTIFICATION = 'notification',

    // Room events
    JOIN_ROOM = 'room:join',
    LEAVE_ROOM = 'room:leave',
}

export interface GigEventPayload {
    gigId: string;
    gig?: unknown;
    ownerId?: string;
}

export interface BidEventPayload {
    bidId: string;
    gigId: string;
    bid?: unknown;
    freelancerId?: string;
}

export interface NotificationPayload {
    id: string;
    type: NotificationType;
    message: string;
    gigId?: string | null;
    bidId?: string | null;
    createdAt: Date;
}

// Legacy types for backward compatibility
export interface TaskEventPayload {
    taskId: string;
    task?: unknown;
    previousAssigneeId?: string;
    newAssigneeId?: string;
}
