import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ==================== ENUMS ====================

export enum NotificationType {
    TASK_ASSIGNED = 'TASK_ASSIGNED', // Legacy
    BID_RECEIVED = 'BID_RECEIVED',
    BID_HIRED = 'BID_HIRED',
    BID_REJECTED = 'BID_REJECTED',
    GIG_ASSIGNED = 'GIG_ASSIGNED',
}

// ==================== INTERFACES ====================

export interface INotification extends Document {
    userId: Types.ObjectId | string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    gigId?: Types.ObjectId | string | null;
    bidId?: Types.ObjectId | string | null;
    createdAt: Date;
}

export interface INotificationMethods { }

export interface NotificationModel extends Model<INotification, {}, INotificationMethods> { }

// ==================== SCHEMA ====================

const notificationSchema = new Schema<INotification, NotificationModel, INotificationMethods>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(NotificationType),
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        gigId: {
            type: Schema.Types.ObjectId,
            ref: 'Gig',
            default: null,
        },
        bidId: {
            type: Schema.Types.ObjectId,
            ref: 'Bid',
            default: null,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// ==================== INDEXES ====================
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ gigId: 1 });

// ==================== VIRTUALS ====================
notificationSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

notificationSchema.virtual('gig', {
    ref: 'Gig',
    localField: 'gigId',
    foreignField: '_id',
    justOne: true,
});

// ==================== EXPORT ====================

const Notification = mongoose.model<INotification, NotificationModel>('Notification', notificationSchema);

export default Notification;
