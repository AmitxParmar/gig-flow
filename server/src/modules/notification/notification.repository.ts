import prisma from '@/lib/prisma';
import { type Notification, type NotificationType } from '@prisma/client';

export interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    message: string;
    gigId?: string;
    bidId?: string;
}

export class NotificationRepository {
    /**
     * Creates a new notification
     */
    public async create(data: CreateNotificationData): Promise<Notification> {
        return prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                message: data.message,
                gigId: data.gigId,
                bidId: data.bidId,
            },
        });
    }

    /**
     * Finds all notifications for a user
     */
    public async findAll(userId: string): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                gig: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
    }

    /**
     * Counts unread notifications for a user
     */
    public async countUnread(userId: string): Promise<number> {
        return prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }

    /**
     * Marks a notification as read
     */
    public async markAsRead(id: string, userId: string): Promise<Notification> {
        return prisma.notification.update({
            where: {
                id,
                userId, // Security check: Ensure notification belongs to user
            },
            data: { isRead: true },
        });
    }

    /**
     * Marks all notifications as read for a user
     */
    public async markAllAsRead(userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: { isRead: true },
        });
    }
}

export default new NotificationRepository();
