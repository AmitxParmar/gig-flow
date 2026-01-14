import Gig, { IGig, GigStatus, GigQuery } from '@/models/Gig';
import Bid from '@/models/Bid';
import logger from '@/lib/logger';


export interface CreateGigData {
    title: string;
    description: string;
    budget: number;
    ownerId: string;
}



export interface UpdateGigData {
    title?: string;
    description?: string;
    budget?: number;
}

export interface GigFilters {
    search?: string;
    status?: GigStatus;
    ownerId?: string;
    excludeUserId?: string;
    cursor?: string;
    limit?: number;
}

export interface GigOwner {
    id: string;
    name: string;
    email: string;
}

export interface GigWithRelations extends IGig {
    title: string;
    description: string;
    budget: number;
    status: GigStatus;
    ownerId: string;
    hiredFreelancerId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    owner: GigOwner;
    hiredFreelancer?: GigOwner | null;
    _count?: {
        bids: number;
    };
}

export interface PaginatedGigs {
    gigs: GigWithRelations[];
    nextCursor: string | null;
}


class GigRepository {
    /**
     * Create a new gig
     */
    async createGig(data: CreateGigData): Promise<GigWithRelations> {
        logger.info(`Creating gig: ${data.title} by user ${data.ownerId}`);

        const gig = await Gig.create({
            title: data.title,
            description: data.description,
            budget: data.budget,
            ownerId: data.ownerId,
        });

        const populatedGig = await Gig.findById(gig._id)
            .populate('ownerId', 'name email')
            .populate('hiredFreelancerId', 'name email');

        return populatedGig as unknown as GigWithRelations;
    }

    /**
     * Find a gig by ID with relations
     */
    async findGigById(id: string): Promise<GigWithRelations | null> {
        const gig = await Gig.findById(id)
            .populate('ownerId', 'name email')
            .populate('hiredFreelancerId', 'name email');

        if (!gig) return null;

        return gig as unknown as GigWithRelations;
    }

    /**
     * Find all gigs with optional filtering, searching, and pagination
     */
    async findAllGigs(filters: GigFilters = {}): Promise<PaginatedGigs> {
        const { search, status, ownerId, cursor, limit = 10 } = filters;

        // Build query
        const query: GigQuery = {};
        if (status) {
            query.status = status;
        }

        if (ownerId) {
            query.ownerId = ownerId;
        }

        if (filters.excludeUserId) {
            query.ownerId = { ...query.ownerId, $ne: filters.excludeUserId };
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (cursor) {
            query._id = { $lt: cursor };
        }

        const gigs = await Gig.find(query)
            .sort({ _id: -1 })
            .limit(limit + 1) // Fetch one extra to check for next page
            .populate('ownerId', 'name email')
            .populate('hiredFreelancerId', 'name email');

        const hasNextPage = gigs.length > limit;
        const edges = hasNextPage ? gigs.slice(0, -1) : gigs;
        const nextCursor = hasNextPage ? edges[edges.length - 1]._id.toString() : null;

        return {
            gigs: edges as unknown as GigWithRelations[],
            nextCursor,
        };
    }

    /**
     * Update a gig by ID
     */
    async updateGig(id: string, data: UpdateGigData): Promise<GigWithRelations> {
        logger.info(`Updating gig: ${id}`);

        const gig = await Gig.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        )
            .populate('ownerId', 'name email')
            .populate('hiredFreelancerId', 'name email');

        if (!gig) {
            throw new Error('Gig not found');
        }

        return gig as unknown as GigWithRelations;
    }

    /**
     * Delete a gig by ID
     */
    async deleteGig(id: string): Promise<void> {
        logger.info(`Deleting gig: ${id}`);
        await Gig.findByIdAndDelete(id);
    }

    /**
     * Update gig status (used during hiring)
     */
    async updateGigStatus(
        id: string,
        status: GigStatus,
        hiredFreelancerId?: string
    ): Promise<IGig> {
        logger.info(`Updating gig ${id} status to ${status}`);

        const updateData: Record<string, any> = { status };
        if (hiredFreelancerId) {
            updateData.hiredFreelancerId = hiredFreelancerId;
        }

        const gig = await Gig.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!gig) {
            throw new Error('Gig not found');
        }

        return gig;
    }

    /**
     * Check if gig has any bids
     */
    async gigHasBids(gigId: string): Promise<boolean> {
        const count = await Bid.countDocuments({ gigId });
        return count > 0;
    }

    /**
     * Get gigs created by a specific user
     */
    async findGigsByOwnerId(ownerId: string): Promise<GigWithRelations[]> {
        const gigs = await Gig.find({ ownerId })
            .sort({ createdAt: -1 })
            .populate('ownerId', 'name email')
            .populate('hiredFreelancerId', 'name email');

        return gigs as unknown as GigWithRelations[];
    }
}

export default new GigRepository();
export { GigStatus };
