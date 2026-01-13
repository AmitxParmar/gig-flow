import Bid, { BidStatus } from '@/models/Bid';
import logger from '@/lib/logger';

export interface CreateBidData {
    gigId: string;
    freelancerId: string;
    message: string;
    price: number;
}

export interface UpdateBidData {
    message?: string;
    price?: number;
}

export interface BidOwner {
    id: string;
    name: string;
    email: string;
}

export interface BidGig {
    id: string;
    title: string;
    budget: number;
    status: string;
    ownerId: string;
    owner: BidOwner;
}

export interface BidWithRelations {
    id: string;
    message: string;
    price: number;
    status: BidStatus;
    gigId: string;
    freelancerId: string;
    createdAt: Date;
    updatedAt: Date;
    freelancer: BidOwner;
    gig: BidGig;
}

export interface BidDocument {
    id: string;
    _id?: any;
    message: string;
    price: number;
    status: BidStatus;
    gigId: any;
    freelancerId: any;
    createdAt: Date;
    updatedAt: Date;
}

// Helper to transform Mongoose document to BidWithRelations
const transformBid = (bid: any): BidWithRelations => {
    const gigData = bid.gigId;
    const freelancerData = bid.freelancerId;

    return {
        id: bid._id?.toString() || bid.id,
        message: bid.message,
        price: bid.price,
        status: bid.status,
        gigId: gigData?._id?.toString() || gigData?.toString() || bid.gigId?.toString(),
        freelancerId: freelancerData?._id?.toString() || freelancerData?.toString() || bid.freelancerId?.toString(),
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
        freelancer: freelancerData?._id ? {
            id: freelancerData._id.toString(),
            name: freelancerData.name,
            email: freelancerData.email,
        } : { id: freelancerData?.toString() || '', name: '', email: '' },
        gig: gigData?._id ? {
            id: gigData._id.toString(),
            title: gigData.title,
            budget: gigData.budget,
            status: gigData.status,
            ownerId: gigData.ownerId?._id?.toString() || gigData.ownerId?.toString(),
            owner: gigData.ownerId?._id ? {
                id: gigData.ownerId._id.toString(),
                name: gigData.ownerId.name,
                email: gigData.ownerId.email,
            } : { id: gigData.ownerId?.toString() || '', name: '', email: '' },
        } : { id: gigData?.toString() || '', title: '', budget: 0, status: '', ownerId: '', owner: { id: '', name: '', email: '' } },
    };
};

class BidRepository {
    /**
     * Create a new bid
     */
    async createBid(data: CreateBidData): Promise<BidWithRelations> {
        logger.info(`Creating bid for gig ${data.gigId} by freelancer ${data.freelancerId}`);

        const bid = await Bid.create({
            gigId: data.gigId,
            freelancerId: data.freelancerId,
            message: data.message,
            price: data.price,
        });

        const populatedBid = await Bid.findById(bid._id)
            .populate('freelancerId', 'name email')
            .populate({
                path: 'gigId',
                select: 'title budget status ownerId',
                populate: {
                    path: 'ownerId',
                    select: 'name email',
                },
            })
            .lean();

        return transformBid(populatedBid);
    }

    /**
     * Find a bid by ID with relations
     */
    async findBidById(id: string): Promise<BidWithRelations | null> {
        const bid = await Bid.findById(id)
            .populate('freelancerId', 'name email')
            .populate({
                path: 'gigId',
                select: 'title budget status ownerId',
                populate: {
                    path: 'ownerId',
                    select: 'name email',
                },
            })
            .lean();

        if (!bid) return null;

        return transformBid(bid);
    }

    /**
     * Find all bids for a specific gig
     */
    async findBidsByGigId(gigId: string): Promise<BidWithRelations[]> {
        const bids = await Bid.find({ gigId })
            .sort({ createdAt: -1 })
            .populate('freelancerId', 'name email')
            .populate({
                path: 'gigId',
                select: 'title budget status ownerId',
                populate: {
                    path: 'ownerId',
                    select: 'name email',
                },
            })
            .lean();

        return bids.map(transformBid);
    }

    /**
     * Find all bids placed by a specific freelancer
     */
    async findBidsByFreelancerId(freelancerId: string): Promise<BidWithRelations[]> {
        const bids = await Bid.find({ freelancerId })
            .sort({ createdAt: -1 })
            .populate('freelancerId', 'name email')
            .populate({
                path: 'gigId',
                select: 'title budget status ownerId',
                populate: {
                    path: 'ownerId',
                    select: 'name email',
                },
            })
            .lean();

        return bids.map(transformBid);
    }

    /**
     * Update a bid by ID
     */
    async updateBid(id: string, data: UpdateBidData): Promise<BidWithRelations> {
        logger.info(`Updating bid: ${id}`);

        const bid = await Bid.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        )
            .populate('freelancerId', 'name email')
            .populate({
                path: 'gigId',
                select: 'title budget status ownerId',
                populate: {
                    path: 'ownerId',
                    select: 'name email',
                },
            })
            .lean();

        if (!bid) {
            throw new Error('Bid not found');
        }

        return transformBid(bid);
    }

    /**
     * Update bid status
     */
    async updateBidStatus(id: string, status: BidStatus): Promise<BidDocument> {
        logger.info(`Updating bid ${id} status to ${status}`);

        const bid = await Bid.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        ).lean();

        if (!bid) {
            throw new Error('Bid not found');
        }

        return {
            id: bid._id.toString(),
            _id: bid._id,
            message: bid.message,
            price: bid.price,
            status: bid.status,
            gigId: bid.gigId,
            freelancerId: bid.freelancerId,
            createdAt: bid.createdAt,
            updatedAt: bid.updatedAt,
        };
    }

    /**
     * Reject all other bids for a gig (except the hired one)
     * Used during the hiring process
     */
    async rejectOtherBids(gigId: string, hiredBidId: string): Promise<number> {
        logger.info(`Rejecting all bids for gig ${gigId} except ${hiredBidId}`);

        const result = await Bid.updateMany(
            {
                gigId,
                _id: { $ne: hiredBidId },
                status: BidStatus.PENDING,
            },
            { $set: { status: BidStatus.REJECTED } }
        );

        return result.modifiedCount;
    }

    /**
     * Check if freelancer already bid on this gig
     */
    async findExistingBid(gigId: string, freelancerId: string): Promise<BidDocument | null> {
        const bid = await Bid.findOne({ gigId, freelancerId }).lean();
        if (!bid) return null;

        return {
            id: bid._id.toString(),
            _id: bid._id,
            message: bid.message,
            price: bid.price,
            status: bid.status,
            gigId: bid.gigId,
            freelancerId: bid.freelancerId,
            createdAt: bid.createdAt,
            updatedAt: bid.updatedAt,
        };
    }

    /**
     * Get all pending bids for a gig (for rejection notifications)
     */
    async findPendingBidsForGig(gigId: string, excludeBidId?: string): Promise<BidDocument[]> {
        const query: Record<string, any> = {
            gigId,
            status: BidStatus.PENDING,
        };

        if (excludeBidId) {
            query._id = { $ne: excludeBidId };
        }

        const bids = await Bid.find(query).lean();
        return bids.map(bid => ({
            id: bid._id.toString(),
            _id: bid._id,
            message: bid.message,
            price: bid.price,
            status: bid.status,
            gigId: bid.gigId,
            freelancerId: bid.freelancerId,
            createdAt: bid.createdAt,
            updatedAt: bid.updatedAt,
        }));
    }
}

export default new BidRepository();
export { BidStatus };
