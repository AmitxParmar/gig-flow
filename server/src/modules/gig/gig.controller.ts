import { type Response, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import gigService from './gig.service';
import { type AuthRequest } from '@/types/auth.type';
import { CreateGigDto, UpdateGigDto, GigQueryDto } from '@/dto/gig.dto';
import Api from '@/lib/api';

class GigController extends Api {
    /**
     * Create a new gig
     * POST /api/gigs
     */
    async createGig(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!._id;
            const data: CreateGigDto = req.body;

            const gig = await gigService.createGig(data, userId);

            this.send(res, gig, HttpStatusCode.Created, 'Gig created successfully');
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

            const userId = req.user?._id;

            const result = await gigService.getGigs({
                search: query.search,
                status: query.status,
                cursor: query.cursor,
                limit: query.limit ? Number(query.limit) : 10,
                excludeUserId: userId,
            });

            this.send(
                res,
                result,
                HttpStatusCode.Ok,
                'Gigs fetched successfully'
            );
            // Note: Pagination meta data needs to be handled carefully if Api.send doesn't support it directly.
            // As per Api.ts, it takes data<T>. We might need to wrap gigs and pagination if we want to send both.
            // However, the previous implementation sent { success, message, data: gigs, pagination }.
            // Api.send sends { message, data }.
            // We should probably modify Api.send or wrap the data.
            // But for now, sticking to the standard Api pattern which likely expects data to contain everything or just the main resource.
            // If we look at previous response:
            /*
            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'Gigs fetched successfully',
                data: result.gigs,
                pagination: { ... }
            });
            */
            // Api.send does:
            /*
            return res.status(statusCode).json({
                message,
                data,
            });
            */
            // So we will lose pagination if we just pass result.gigs.
            // Let's pass the whole result including pagination if possible, or we need to overload/extend Api.
            // But the instructions are to "extend the class to @[Api]".
            // Given the Api.ts implementation, 'data' is generic T.
            // So I can structure T to be { items: result.gigs, pagination: ... } or just return the result (which has { gigs, total, ... }).
            // Let's look at gigService.getGigs return type. It returns { gigs, total, page, limit, totalPages }.
            // So if I pass 'result' as data, the response will be { message, data: { gigs, total, ... } }. 
            // This is slightly differently structured than before (data was gigs, pagination was sibling).
            // But strictly following "extend Api", this is the way.
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

            this.send(res, gig, HttpStatusCode.Ok, 'Gig fetched successfully');
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
            const userId = req.user!._id;
            const { id } = req.params;
            const data: UpdateGigDto = req.body;

            const gig = await gigService.updateGig(id, data, userId);

            this.send(res, gig, HttpStatusCode.Ok, 'Gig updated successfully');
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
            const userId = req.user!._id;
            const { id } = req.params;

            await gigService.deleteGig(id, userId);

            this.send(res, null, HttpStatusCode.Ok, 'Gig deleted successfully');
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
            const userId = req.user!._id;
            const query: GigQueryDto = req.query as unknown as GigQueryDto;

            const result = await gigService.getGigs({
                ownerId: userId,
                cursor: query.cursor,
                limit: query.limit ? Number(query.limit) : 10,
            });

            this.send(res, result, HttpStatusCode.Ok, 'Your gigs fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new GigController();
