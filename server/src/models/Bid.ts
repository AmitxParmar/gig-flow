import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ==================== ENUMS ====================

export enum BidStatus {
    PENDING = 'PENDING',
    HIRED = 'HIRED',
    REJECTED = 'REJECTED',
}

// ==================== INTERFACES ====================

export interface IBid extends Document {
    _id: Types.ObjectId;
    message: string;
    price: number;
    status: BidStatus;
    gigId: Types.ObjectId | string;
    freelancerId: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBidMethods { }

export interface BidModel extends Model<IBid, {}, IBidMethods> { }

// ==================== SCHEMA ====================

const bidSchema = new Schema<IBid, BidModel, IBidMethods>(
    {
        message: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(BidStatus),
            default: BidStatus.PENDING,
        },
        gigId: {
            type: Schema.Types.ObjectId,
            ref: 'Gig',
            required: true,
        },
        freelancerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// ==================== INDEXES ====================
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true }); // One bid per freelancer per gig
bidSchema.index({ gigId: 1, status: 1 });
bidSchema.index({ freelancerId: 1 });

// ==================== VIRTUALS ====================
bidSchema.virtual('freelancer', {
    ref: 'User',
    localField: 'freelancerId',
    foreignField: '_id',
    justOne: true,
});

bidSchema.virtual('gig', {
    ref: 'Gig',
    localField: 'gigId',
    foreignField: '_id',
    justOne: true,
});

// ==================== EXPORT ====================

const Bid = mongoose.model<IBid, BidModel>('Bid', bidSchema);

export default Bid;
