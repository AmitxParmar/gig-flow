import { type Response, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import bidService from './bid.service';
import { type AuthRequest } from '@/types/auth.type';
import { CreateBidDto, UpdateBidDto } from '@/dto/bid.dto';
import Api from '@/lib/api';

class BidController extends Api {
    /**
     * Submit a new bid
     * POST /api/bids
     */
    async createBid(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!._id;
            const data: CreateBidDto = req.body;

            const bid = await bidService.createBid(data, userId);

            this.send(res, bid, HttpStatusCode.Created, 'Bid submitted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all bids for a specific gig (owner only)
     * GET /api/bids/:gigId
     */
    async getBidsForGig(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!._id;
            const { gigId } = req.params;

            const bids = await bidService.getBidsForGig(gigId, userId);

            this.send(res, bids, HttpStatusCode.Ok, 'Bids fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all bids placed by the current user
     * GET /api/bids/my
     */
    async getMyBids(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!._id;

            const bids = await bidService.getMyBids(userId);

            this.send(res, bids, HttpStatusCode.Ok, 'Your bids fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a bid
     * PUT /api/bids/:bidId
     */
    async updateBid(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!._id;
            const { bidId } = req.params;
            const data: UpdateBidDto = req.body;

            const bid = await bidService.updateBid(bidId, data, userId);

            this.send(res, bid, HttpStatusCode.Ok, 'Bid updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Hire a freelancer (the critical hiring action)
     * PATCH /api/bids/:bidId/hire
     */
    async hireBid(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!._id;
            const { bidId } = req.params;

            const bid = await bidService.hireBid(bidId, userId);

            this.send(res, bid, HttpStatusCode.Ok, 'Freelancer hired successfully!');
        } catch (error) {
            next(error);
        }
    }
}

export default new BidController();
