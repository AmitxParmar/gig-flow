import { type GigStatus } from '@prisma/client';
import gigRepository, {
    type GigWithRelations,
    type PaginatedGigs,
    type GigFilters,
} from './gig.repository';
import { HttpNotFoundError, HttpBadRequestError, HttpUnAuthorizedError } from '@/lib/errors';
import logger from '@/lib/logger';

export interface CreateGigInput {
    title: string;
    description: string;
    budget: number;
}

export interface UpdateGigInput {
    title?: string;
    description?: string;
    budget?: number;
}

class GigService {
    /**
     * Create a new gig
     * The user becomes the owner (client) of this gig
     */
    async createGig(data: CreateGigInput, userId: string): Promise<GigWithRelations> {
        logger.info(`Creating new gig: ${data.title} by user ${userId}`);

        const gig = await gigRepository.createGig({
            ...data,
            ownerId: userId,
        });

        logger.info(`Gig created: ${gig.id} by user ${userId}`);
        return gig;
    }

    /**
     * Get all gigs with optional filtering and pagination
     * Supports search by title and status filter
     */
    async getGigs(filters: GigFilters = {}): Promise<PaginatedGigs> {
        // Default to showing only OPEN gigs unless status is specified
        const queryFilters: GigFilters = {
            ...filters,
            status: filters.status || ('OPEN' as GigStatus),
        };

        return gigRepository.findAllGigs(queryFilters);
    }

    /**
     * Get all open gigs (public feed)
     */
    async getOpenGigs(filters: Omit<GigFilters, 'status'> = {}): Promise<PaginatedGigs> {
        return gigRepository.findAllGigs({
            ...filters,
            status: 'OPEN' as GigStatus,
        });
    }

    /**
     * Get a single gig by ID
     */
    async getGigById(gigId: string): Promise<GigWithRelations> {
        const gig = await gigRepository.findGigById(gigId);

        if (!gig) {
            throw new HttpNotFoundError('Gig not found');
        }

        return gig;
    }

    /**
     * Update a gig
     * Only the owner can update their gig
     * Cannot update if gig is already assigned
     */
    async updateGig(
        gigId: string,
        data: UpdateGigInput,
        userId: string
    ): Promise<GigWithRelations> {
        logger.info(`Updating gig: ${gigId} by user ${userId}`);

        const gig = await gigRepository.findGigById(gigId);

        if (!gig) {
            throw new HttpNotFoundError('Gig not found');
        }

        // Check ownership
        if (gig.ownerId !== userId) {
            throw new HttpUnAuthorizedError('You are not authorized to update this gig');
        }

        // Check if gig is already assigned
        if (gig.status === 'ASSIGNED') {
            throw new HttpBadRequestError('Cannot update an assigned gig', [
                'This gig has already been assigned to a freelancer',
            ]);
        }

        const updatedGig = await gigRepository.updateGig(gigId, data);
        logger.info(`Gig updated successfully: ${gigId}`);

        return updatedGig;
    }

    /**
     * Delete a gig
     * Only the owner can delete their gig
     * Cannot delete if gig has any bids
     */
    async deleteGig(gigId: string, userId: string): Promise<void> {
        logger.info(`Deleting gig: ${gigId} by user ${userId}`);

        const gig = await gigRepository.findGigById(gigId);

        if (!gig) {
            throw new HttpNotFoundError('Gig not found');
        }

        // Check ownership
        if (gig.ownerId !== userId) {
            throw new HttpUnAuthorizedError('You are not authorized to delete this gig');
        }

        // Check if gig has bids
        const hasBids = await gigRepository.gigHasBids(gigId);
        if (hasBids) {
            throw new HttpBadRequestError('Cannot delete a gig with bids', [
                'This gig has received bids and cannot be deleted',
                'You can close the gig by assigning a freelancer instead',
            ]);
        }

        await gigRepository.deleteGig(gigId);
        logger.info(`Gig deleted successfully: ${gigId}`);
    }

    /**
     * Get gigs created by the current user (my posted gigs)
     */
    async getMyGigs(userId: string): Promise<GigWithRelations[]> {
        return gigRepository.findGigsByOwnerId(userId);
    }

    /**
     * Check if user is the owner of a gig
     */
    async isGigOwner(gigId: string, userId: string): Promise<boolean> {
        const gig = await gigRepository.findGigById(gigId);
        return gig?.ownerId === userId;
    }
}

export default new GigService();
