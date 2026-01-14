import type { Gig } from './gig'

// Socket Events enum matching backend
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

// Gig Event Payload
export interface GigEventPayload {
    gigId: string
    gig?: Gig
    previousAssigneeId?: string // owner/hired freelancer logic if needed
    hiredFreelancerId?: string
}

// Notification Payload
export interface NotificationPayload {
    _id: string
    type: string
    message: string
    gigId?: string
    createdAt: Date
}
