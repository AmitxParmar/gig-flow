import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ==================== INTERFACES ====================

export interface ISession extends Document {
    id: string;
    userId: Types.ObjectId | string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    createdAt: Date;
}

export interface ISessionMethods { }

export interface SessionModel extends Model<ISession, {}, ISessionMethods> { }

// ==================== SCHEMA ====================

const sessionSchema = new Schema<ISession, SessionModel, ISessionMethods>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true,
        },
        userAgent: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// ==================== INDEXES ====================
sessionSchema.index({ userId: 1 });
sessionSchema.index({ refreshToken: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// ==================== EXPORT ====================

const Session = mongoose.model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
