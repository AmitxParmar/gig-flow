import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ==================== ENUMS ====================

export enum GigStatus {
    OPEN = 'OPEN',
    ASSIGNED = 'ASSIGNED',
}

// ==================== INTERFACES ====================

export interface IGig extends Document {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: GigStatus;
    ownerId: Types.ObjectId | string;
    hiredFreelancerId?: Types.ObjectId | string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGigMethods { }

export interface GigModel extends Model<IGig, {}, IGigMethods> { }

// ==================== SCHEMA ====================

const gigSchema = new Schema<IGig, GigModel, IGigMethods>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(GigStatus),
            default: GigStatus.OPEN,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hiredFreelancerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                return {
                    id: ret._id.toString(),
                    title: ret.title,
                    description: ret.description,
                    budget: ret.budget,
                    status: ret.status,
                    ownerId: ret.ownerId,
                    hiredFreelancerId: ret.hiredFreelancerId,
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
                    title: ret.title,
                    description: ret.description,
                    budget: ret.budget,
                    status: ret.status,
                    ownerId: ret.ownerId,
                    hiredFreelancerId: ret.hiredFreelancerId,
                    createdAt: ret.createdAt,
                    updatedAt: ret.updatedAt,
                };
            },
        },
    }
);

// ==================== INDEXES ====================
gigSchema.index({ ownerId: 1, status: 1 });
gigSchema.index({ status: 1 });
gigSchema.index({ title: 'text' }); // Text search index

// ==================== VIRTUALS ====================
gigSchema.virtual('owner', {
    ref: 'User',
    localField: 'ownerId',
    foreignField: '_id',
    justOne: true,
});

gigSchema.virtual('hiredFreelancer', {
    ref: 'User',
    localField: 'hiredFreelancerId',
    foreignField: '_id',
    justOne: true,
});

gigSchema.virtual('bids', {
    ref: 'Bid',
    localField: '_id',
    foreignField: 'gigId',
});

// ==================== EXPORT ====================

const Gig = mongoose.model<IGig, GigModel>('Gig', gigSchema);

export default Gig;
