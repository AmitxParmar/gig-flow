import { type Response, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import gigService from './gig.service';
import { type AuthRequest } from '@/types/auth.type';
import { CreateGigDto, UpdateGigDto, GigQueryDto } from '@/dto/gig.dto';
import logger from '@/lib/logger';

class GigController {
    /**
     * Create a new gig
     * POST /api/gigs
     */
    async createGig(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const data: CreateGigDto = req.body;

            const gig = await gigService.createGig(data, userId);

            res.status(HttpStatusCode.Created).json({
                success: true,
                message: 'Gig created successfully',
                data: gig,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all gigs with optional search and filtering
     * GET /api/gigs?search=keyword&status=OPEN&page=1&limit=10
     */
    async getGigs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const query: GigQueryDto = req.query as unknown as GigQueryDto;

            const result = await gigService.getGigs({
                search: query.search,
                status: query.status,
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 10,
            });

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Gigs fetched successfully',
                data: result.gigs,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single gig by ID
     * GET /api/gigs/:id
     */
    async getGigById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const gig = await gigService.getGigById(id);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Gig fetched successfully',
                data: gig,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a gig
     * PUT /api/gigs/:id
     */
    async updateGig(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const data: UpdateGigDto = req.body;

            const gig = await gigService.updateGig(id, data, userId);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Gig updated successfully',
                data: gig,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a gig
     * DELETE /api/gigs/:id
     */
    async deleteGig(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            await gigService.deleteGig(id, userId);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Gig deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user's posted gigs
     * GET /api/gigs/my
     */
    async getMyGigs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;

            const gigs = await gigService.getMyGigs(userId);

            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Your gigs fetched successfully',
                data: gigs,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new GigController();
