import Bid, { IBid, BidStatus } from '@/models/Bid';
import { IGig } from '@/models/Gig'; // Will need to ignore missing import or assume simplified usage
import { IUser } from '@/models/User';
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

// Reuse IBid but extend for populated fields
export interface BidWithRelations extends Omit<IBid, 'freelancer' | 'gig'> {
    freelancer: Partial<IUser>;
    gig: Partial<IGig> & { owner: Partial<IUser> };
}

// Basic document
export interface BidDocument extends IBid { }


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
            .populate('freelancer', 'name email')
            .populate({
                path: 'gig',
                select: 'title budget status ownerId',
                populate: {
                    path: 'owner',
                    select: 'name email',
                },
            })
            .lean();

        return populatedBid as unknown as BidWithRelations;
    }

    /**
     * Find a bid by ID with relations
     */
    async findBidById(id: string): Promise<BidWithRelations | null> {
        const bid = await Bid.findById(id)
            .populate('freelancer', 'name email')
            .populate({
                path: 'gig',
                select: 'title budget status ownerId',
                populate: {
                    path: 'owner',
                    select: 'name email',
                },
            })
            .lean();

        if (!bid) return null;

        return bid as unknown as BidWithRelations;
    }

    /**
     * Find all bids for a specific gig
     */
    async findBidsByGigId(gigId: string): Promise<BidWithRelations[]> {
        const bids = await Bid.find({ gigId })
            .sort({ createdAt: -1 })
            .populate('freelancer', 'name email')
            .populate({
                path: 'gig',
                select: 'title budget status ownerId',
                populate: {
                    path: 'owner',
                    select: 'name email',
                },
            })
            .lean();

        return bids as unknown as BidWithRelations[];
    }

    /**
     * Find all bids placed by a specific freelancer
     */
    async findBidsByFreelancerId(freelancerId: string): Promise<BidWithRelations[]> {
        const bids = await Bid.find({ freelancerId })
            .sort({ createdAt: -1 })
            .populate('freelancer', 'name email')
            .populate({
                path: 'gig',
                select: 'title budget status ownerId',
                populate: {
                    path: 'owner',
                    select: 'name email',
                },
            })
            .lean();

        return bids as unknown as BidWithRelations[];
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
            .populate('freelancer', 'name email')
            .populate({
                path: 'gig',
                select: 'title budget status ownerId',
                populate: {
                    path: 'owner',
                    select: 'name email',
                },
            })
            .lean();

        if (!bid) {
            throw new Error('Bid not found');
        }

        return bid as unknown as BidWithRelations;
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

        return bid as unknown as BidDocument;
    }

    /**
     * Reject all other bids for a gig (except the hired one)
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

        return bid as unknown as BidDocument;
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
        return bids as unknown as BidDocument[];
    }
}

export default new BidRepository();
export { BidStatus };
