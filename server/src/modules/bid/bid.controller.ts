import { type Response, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import bidService from './bid.service';
import { type AuthRequest } from '@/types/auth.type';
import { CreateBidDto, UpdateBidDto } from '@/dto/bid.dto';
import logger from '@/lib/logger';

class BidController {
    /**
     * Submit a new bid
     * POST /api/bids
     */
    async createBid(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const data: CreateBidDto = req.body;

            const bid = await bidService.createBid(data, userId);

            res.status(HttpStatusCode.Created).json({
                success: true,
                message: 'Bid submitted successfully',
                data: bid,
            });
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
            const userId = req.user!.id;
            const { gigId } = req.params;

            const bids = await bidService.getBidsForGig(gigId, userId);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Bids fetched successfully',
                data: bids,
            });
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
            const userId = req.user!.id;

            const bids = await bidService.getMyBids(userId);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Your bids fetched successfully',
                data: bids,
            });
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
            const userId = req.user!.id;
            const { bidId } = req.params;
            const data: UpdateBidDto = req.body;

            const bid = await bidService.updateBid(bidId, data, userId);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Bid updated successfully',
                data: bid,
            });
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
            const userId = req.user!.id;
            const { bidId } = req.params;

            const bid = await bidService.hireBid(bidId, userId);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Freelancer hired successfully!',
                data: bid,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new BidController();
