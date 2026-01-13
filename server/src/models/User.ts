import mongoose, { Schema, Document, Model } from 'mongoose';

// ==================== INTERFACES ====================

export interface IUser extends Document {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserMethods { }

export interface UserModel extends Model<IUser, {}, IUserMethods> { }

// ==================== SCHEMA ====================

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                return {
                    id: ret._id.toString(),
                    name: ret.name,
                    email: ret.email,
                    passwordHash: ret.passwordHash,
                    createdAt: ret.createdAt,
                    updatedAt: ret.updatedAt,
                };
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc, ret) => {
                return {
                    id: ret._id.toString(),
                    name: ret.name,
                    email: ret.email,
                    passwordHash: ret.passwordHash,
                    createdAt: ret.createdAt,
                    updatedAt: ret.updatedAt,
                };
            },
        },
    }
);

// ==================== INDEXES ====================
userSchema.index({ email: 1 }, { unique: true });

// ==================== EXPORT ====================

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
