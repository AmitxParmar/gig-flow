import notificationRepository, {
    NotificationType,
    NotificationWithGig,
    NotificationDocument
} from './notification.repository';
import socketService from '@/lib/socket';
import logger from '@/lib/logger';
import { HttpNotFoundError } from '@/lib/errors';

export default class NotificationService {
    /**
     * Get all notifications for a user
     */
    public async getMyNotifications(userId: string): Promise<NotificationWithGig[]> {
        return notificationRepository.findAll(userId);
    }

    /**
     * Get unread count for a user
     */
    public async getUnreadCount(userId: string): Promise<{ count: number }> {
        const count = await notificationRepository.countUnread(userId);
        return { count };
    }

    /**
     * Mark a notification as read
     */
    public async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
        try {
            return await notificationRepository.markAsRead(id, userId);
        } catch (error) {
            throw new HttpNotFoundError('Notification not found or access denied');
        }
    }

    /**
     * Mark all notifications as read
     */
    public async markAllAsRead(userId: string): Promise<void> {
        await notificationRepository.markAllAsRead(userId);
    }

    /**
     * Create a notification for gig-related events and emit via socket
     */
    public async createGigNotification(
        userId: string,
        type: NotificationType,
        message: string,
        gigId: string,
        bidId?: string
    ): Promise<void> {
        try {
            // 1. Persist to DB
            const notification = await notificationRepository.create({
                userId,
                type,
                message,
                gigId,
                bidId,
            });

            // 2. Emit Real-time Notification
            socketService.sendNotificationToUser(userId, {
                id: notification.id,
                type: notification.type,
                message: notification.message,
                gigId: notification.gigId || null,
                bidId: notification.bidId || null,
                createdAt: notification.createdAt,
            });

            logger.info(`Notification created for user ${userId}: ${type}`);
        } catch (error) {
            logger.error('Failed to create notification', error);
            // We don't throw here to avoid blocking the main operation
        }
    }

    /**
     * Notify freelancer when they are hired
     */
    public async notifyHired(
        freelancerId: string,
        gigTitle: string,
        gigId: string,
        bidId: string
    ): Promise<void> {
        const message = `🎉 Congratulations! You have been hired for: "${gigTitle}"`;
        await this.createGigNotification(
            freelancerId,
            NotificationType.BID_HIRED,
            message,
            gigId,
            bidId
        );
    }

    /**
     * Notify freelancer when their bid is rejected
     */
    public async notifyBidRejected(
        freelancerId: string,
        gigTitle: string,
        gigId: string,
        bidId: string
    ): Promise<void> {
        const message = `Your bid for "${gigTitle}" was not selected.`;
        await this.createGigNotification(
            freelancerId,
            NotificationType.BID_REJECTED,
            message,
            gigId,
            bidId
        );
    }

    /**
     * Notify gig owner when they receive a new bid
     */
    public async notifyNewBid(
        ownerId: string,
        gigTitle: string,
        gigId: string,
        bidId: string,
        freelancerName: string
    ): Promise<void> {
        const message = `${freelancerName} has submitted a bid on your gig: "${gigTitle}"`;
        await this.createGigNotification(
            ownerId,
            NotificationType.BID_RECEIVED,
            message,
            gigId,
            bidId
        );
    }
}
