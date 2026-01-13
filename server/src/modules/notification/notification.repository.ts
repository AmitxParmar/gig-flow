import Notification, { NotificationType } from '@/models/Notification';

export interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    message: string;
    gigId?: string;
    bidId?: string;
}

export interface NotificationDocument {
    id: string;
    _id?: any;
    userId: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    gigId?: string | null;
    bidId?: string | null;
    createdAt: Date;
}

export interface NotificationWithGig extends NotificationDocument {
    gig?: {
        id: string;
        title: string;
    } | null;
}

// Helper to transform notification
const transformNotification = (notification: any): NotificationWithGig => {
    return {
        id: notification._id?.toString() || notification.id,
        userId: notification.userId?.toString(),
        type: notification.type,
        message: notification.message,
        isRead: notification.isRead,
        gigId: notification.gigId?._id?.toString() || notification.gigId?.toString() || null,
        bidId: notification.bidId?.toString() || null,
        createdAt: notification.createdAt,
        gig: notification.gigId?._id ? {
            id: notification.gigId._id.toString(),
            title: notification.gigId.title,
        } : null,
    };
};

export class NotificationRepository {
    /**
     * Creates a new notification
     */
    public async create(data: CreateNotificationData): Promise<NotificationDocument> {
        const notification = await Notification.create({
            userId: data.userId,
            type: data.type,
            message: data.message,
            gigId: data.gigId || null,
            bidId: data.bidId || null,
        });

        return {
            id: notification._id.toString(),
            _id: notification._id,
            userId: notification.userId.toString(),
            type: notification.type,
            message: notification.message,
            isRead: notification.isRead,
            gigId: notification.gigId?.toString() || null,
            bidId: notification.bidId?.toString() || null,
            createdAt: notification.createdAt,
        };
    }

    /**
     * Finds all notifications for a user
     */
    public async findAll(userId: string): Promise<NotificationWithGig[]> {
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .populate('gigId', 'title')
            .lean();

        return notifications.map(transformNotification);
    }

    /**
     * Counts unread notifications for a user
     */
    public async countUnread(userId: string): Promise<number> {
        return Notification.countDocuments({
            userId,
            isRead: false,
        });
    }

    /**
     * Marks a notification as read
     */
    public async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { $set: { isRead: true } },
            { new: true }
        ).lean();

        if (!notification) {
            throw new Error('Notification not found or access denied');
        }

        return {
            id: notification._id.toString(),
            _id: notification._id,
            userId: notification.userId.toString(),
            type: notification.type,
            message: notification.message,
            isRead: notification.isRead,
            gigId: notification.gigId?.toString() || null,
            bidId: notification.bidId?.toString() || null,
            createdAt: notification.createdAt,
        };
    }

    /**
     * Marks all notifications as read for a user
     */
    public async markAllAsRead(userId: string): Promise<void> {
        await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );
    }
}

export default new NotificationRepository();
export { NotificationType };
