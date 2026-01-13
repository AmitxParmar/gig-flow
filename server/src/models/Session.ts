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
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                return {
                    id: ret._id.toString(),
                    userId: ret.userId,
                    refreshToken: ret.refreshToken,
                    userAgent: ret.userAgent,
                    ipAddress: ret.ipAddress,
                    expiresAt: ret.expiresAt,
                    createdAt: ret.createdAt,
                };
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc, ret) => {
                return {
                    id: ret._id.toString(),
                    userId: ret.userId,
                    refreshToken: ret.refreshToken,
                    userAgent: ret.userAgent,
                    ipAddress: ret.ipAddress,
                    expiresAt: ret.expiresAt,
                    createdAt: ret.createdAt,
                };
            },
        },
    }
);

// ==================== INDEXES ====================
sessionSchema.index({ userId: 1 });
sessionSchema.index({ refreshToken: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// ==================== EXPORT ====================

const Session = mongoose.model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
