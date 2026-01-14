import mongoose from 'mongoose';
import bidRepository, {
    type BidWithRelations,
    BidStatus,
} from './bid.repository';
import gigRepository, { GigStatus } from '../gig/gig.repository';
import { HttpNotFoundError, HttpBadRequestError, HttpUnAuthorizedError } from '@/lib/errors';
import NotificationService from '../notification/notification.service';
import socketService from '@/lib/socket';
import Gig from '@/models/Gig';
import Bid from '@/models/Bid';
import logger from '@/lib/logger';

export interface CreateBidInput {
    gigId: string;
    message: string;
    price: number;
}

export interface UpdateBidInput {
    message?: string;
    price?: number;
}

const notificationService = new NotificationService();

class BidService {
    /**
     * Submit a new bid on a gig
     * - Cannot bid on your own gig
     * - Cannot bid twice on the same gig
     * - Can only bid on OPEN gigs
     */
    async createBid(data: CreateBidInput, userId: string): Promise<BidWithRelations> {
        logger.info(`Creating bid for gig ${data.gigId} by user ${userId}`);

        // Check if gig exists
        const gig = await gigRepository.findGigById(data.gigId);
        if (!gig) {
            throw new HttpNotFoundError('Gig not found');
        }

        // Check if gig is open
        if (gig.status !== GigStatus.OPEN) {
            throw new HttpBadRequestError('Cannot bid on this gig', [
                'This gig is no longer accepting bids',
            ]);
        }

        // Check if user is trying to bid on their own gig
        if (gig.ownerId.toString() === userId.toString()) {
            throw new HttpBadRequestError('Cannot bid on your own gig', [
                'You cannot submit a bid on a gig you created',
            ]);
        }

        // Check if user already has a bid on this gig
        const existingBid = await bidRepository.findExistingBid(data.gigId, userId);
        if (existingBid) {
            throw new HttpBadRequestError('You have already bid on this gig', [
                'You can only submit one bid per gig',
                'You may update your existing bid instead',
            ]);
        }

        // Create the bid
        const bid = await bidRepository.createBid({
            gigId: data.gigId,
            freelancerId: userId,
            message: data.message,
            price: data.price,
        });

        // Notify gig owner about new bid
        await notificationService.notifyNewBid(
            gig.ownerId.toString(),
            gig.title,
            gig._id.toString(),
            bid._id.toString(),
            bid.freelancer.name!
        );

        // Emit socket event for real-time update
        socketService.notifyBidReceived(gig.ownerId.toString(), {
            bidId: bid._id.toString(),
            gigId: gig._id.toString(),
            bid,
            freelancerId: userId,
        });

        logger.info(`Bid created: ${bid._id.toString()} for gig ${data.gigId.toString()}`);
        return bid;
    }

    /**
     * Get all bids for a gig
     * Only the gig owner can see all bids
     */
    async getBidsForGig(gigId: string, userId: string): Promise<BidWithRelations[]> {
        logger.info(`[BidService] getBidsForGig: gigId=${gigId}, userId=${userId}`);
        // Check if gig exists
        const gig = await gigRepository.findGigById(gigId);
        if (!gig) {
            throw new HttpNotFoundError('Gig not found');
        }

        let gigOwnerId = gig.ownerId;
        // If ownerId is populated (is an object), extract the _id
        if (typeof gigOwnerId === 'object' && gigOwnerId !== null && '_id' in gigOwnerId) {
            gigOwnerId = (gigOwnerId as any)._id;
        }

        // Check if user is the gig owner
        if (gigOwnerId.toString() !== userId.toString()) {
            logger.error(`[BidService.getBidsForGig] Ownership check failed`, {
                gigId,
                originalGigOwnerId: gig.ownerId,
                resolvedGigOwnerId: gigOwnerId,
                userId,
                isMatch: gigOwnerId.toString() === userId.toString()
            });
            throw new HttpUnAuthorizedError('Only the gig owner can view all bids');
        }

        return bidRepository.findBidsByGigId(gigId);
    }

    /**
     * Get all bids placed by the current user
     */
    async getMyBids(userId: string): Promise<BidWithRelations[]> {
        return bidRepository.findBidsByFreelancerId(userId);
    }

    /**
     * Get a single bid by ID
     */
    async getBidById(bidId: string): Promise<BidWithRelations> {
        const bid = await bidRepository.findBidById(bidId);
        if (!bid) {
            throw new HttpNotFoundError('Bid not found');
        }
        return bid;
    }

    /**
     * Update a bid (only allowed for pending bids by the freelancer)
     */
    async updateBid(
        bidId: string,
        data: UpdateBidInput,
        userId: string
    ): Promise<BidWithRelations> {
        const bid = await bidRepository.findBidById(bidId);

        if (!bid) {
            throw new HttpNotFoundError('Bid not found');
        }

        // Check ownership
        if (bid.freelancerId !== userId) {
            throw new HttpUnAuthorizedError('You can only update your own bids');
        }

        // Check if bid is still pending
        if (bid.status !== BidStatus.PENDING) {
            throw new HttpBadRequestError('Cannot update this bid', [
                'You can only update pending bids',
            ]);
        }

        return bidRepository.updateBid(bidId, data);
    }

    /**
     * HIRE a freelancer - the critical hiring logic
     * 
     * This operation:
     * 1. Verifies the gig is still OPEN (prevents race condition)
     * 2. Updates the selected bid status to HIRED
     * 3. Rejects all other pending bids
     * 4. Updates the gig status to ASSIGNED
     * 5. Sends notifications to all affected freelancers
     * 
     * Uses MongoDB transaction for atomic execution
     */
    async hireBid(bidId: string, userId: string): Promise<BidWithRelations> {
        logger.info(`Hiring freelancer for bid ${bidId} by user ${userId}`);

        // First, get the bid to validate
        const bid = await bidRepository.findBidById(bidId);
        if (!bid) {
            throw new HttpNotFoundError('Bid not found');
        }

        // Verify the user is the gig owner
        if (bid?.gig?.ownerId?.toString() !== userId.toString()) {
            throw new HttpUnAuthorizedError('Only the gig owner can hire freelancers');
        }

        // Check if bid is pending
        if (bid.status !== BidStatus.PENDING) {
            throw new HttpBadRequestError('Cannot hire this bid', [
                `This bid has already been ${bid.status.toLowerCase()}`,
            ]);
        }

        // Check if gig is still open (prevents race condition)
        if (bid.gig.status !== GigStatus.OPEN) {
            throw new HttpBadRequestError('This gig is no longer accepting bids', [
                'Another freelancer may have already been hired',
            ]);
        }

        // Get all pending bids before the transaction (for notifications)
        const pendingBids = await bidRepository.findPendingBidsForGig(bid.gigId.toString(), bidId);

        // Start MongoDB session for transaction
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // Double-check gig is still OPEN inside transaction
                const currentGig = await Gig.findById(bid.gigId)
                    .select('status')
                    .session(session)
                    .lean();

                if (!currentGig || currentGig.status !== GigStatus.OPEN) {
                    throw new Error('RACE_CONDITION');
                }

                // 1. Update the hired bid status
                await Bid.findByIdAndUpdate(
                    bidId,
                    { $set: { status: BidStatus.HIRED } },
                    { session }
                );

                // 2. Reject all other pending bids
                await Bid.updateMany(
                    {
                        gigId: bid.gigId,
                        _id: { $ne: bidId },
                        status: BidStatus.PENDING,
                    },
                    { $set: { status: BidStatus.REJECTED } },
                    { session }
                );

                // 3. Update gig status to ASSIGNED
                await Gig.findByIdAndUpdate(
                    bid.gigId,
                    {
                        $set: {
                            status: GigStatus.ASSIGNED,
                            hiredFreelancerId: bid.freelancerId,
                        },
                    },
                    { session }
                );
            });
        } catch (error: any) {
            if (error.message === 'RACE_CONDITION') {
                throw new HttpBadRequestError('This gig is no longer available', [
                    'Another freelancer was hired while processing your request',
                ]);
            }
            logger.error('Transaction failed during hiring:', error);
            throw error;
        } finally {
            await session.endSession();
        }

        // Get the updated bid
        const updatedBid = await bidRepository.findBidById(bidId);
        if (!updatedBid) {
            throw new HttpNotFoundError('Bid not found after update');
        }

        // Send notifications (outside transaction for performance)
        // Notify hired freelancer
        await notificationService.notifyHired(
            bid.freelancerId.toString(),
            bid.gig.title as string,
            bid.gigId.toString(),
            bidId
        );

        // Emit socket event for hired freelancer
        socketService.notifyBidHired(bid.freelancerId.toString(), {
            bidId,
            gigId: bid.gigId.toString(),
            bid: updatedBid,
            freelancerId: bid.freelancerId.toString(),
        });

        // Notify rejected freelancers
        for (const rejectedBid of pendingBids) {
            await notificationService.notifyBidRejected(
                rejectedBid.freelancerId.toString(),
                bid.gig.title as string,
                bid.gigId.toString(),
                rejectedBid._id.toString()
            );

            socketService.notifyBidRejected(rejectedBid.freelancerId.toString(), {
                bidId: rejectedBid._id.toString(),
                gigId: bid.gigId.toString(),
                freelancerId: rejectedBid.freelancerId.toString(),
            });
        }

        logger.info(`Freelancer ${bid.freelancerId} hired for gig ${bid.gigId}`);
        return updatedBid;
    }
}

export default new BidService();
