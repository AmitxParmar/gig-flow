import Gig, { IGig, GigStatus } from '@/models/Gig';
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
    page?: number;
    limit?: number;
}

export interface GigOwner {
    id: string;
    name: string;
    email: string;
}

export interface GigWithRelations {
    id: string;
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
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Helper to transform Mongoose document to GigWithRelations
const transformGig = async (gig: any, includeBidCount = true): Promise<GigWithRelations> => {
    const bidCount = includeBidCount ? await Bid.countDocuments({ gigId: gig._id }) : 0;

    return {
        id: gig._id?.toString() || gig.id,
        title: gig.title,
        description: gig.description,
        budget: gig.budget,
        status: gig.status,
        ownerId: gig.ownerId?._id?.toString() || gig.ownerId?.toString(),
        hiredFreelancerId: gig.hiredFreelancerId?._id?.toString() || gig.hiredFreelancerId?.toString() || null,
        createdAt: gig.createdAt,
        updatedAt: gig.updatedAt,
        owner: gig.ownerId?._id ? {
            id: gig.ownerId._id.toString(),
            name: gig.ownerId.name,
            email: gig.ownerId.email,
        } : { id: gig.ownerId?.toString() || '', name: '', email: '' },
        hiredFreelancer: gig.hiredFreelancerId?._id ? {
            id: gig.hiredFreelancerId._id.toString(),
            name: gig.hiredFreelancerId.name,
            email: gig.hiredFreelancerId.email,
        } : null,
        _count: {
            bids: bidCount,
        },
    };
};

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
            .populate('hiredFreelancerId', 'name email')
            .lean();

        return transformGig(populatedGig);
    }

    /**
     * Find a gig by ID with relations
     */
    async findGigById(id: string): Promise<GigWithRelations | null> {
        const gig = await Gig.findById(id)
            .populate('ownerId', 'name email')
            .populate('hiredFreelancerId', 'name email')
            .lean();

        if (!gig) return null;

        return transformGig(gig);
    }

    /**
     * Find all gigs with optional filtering, searching, and pagination
     */
    async findAllGigs(filters: GigFilters = {}): Promise<PaginatedGigs> {
        const { search, status, ownerId, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, any> = {};

        if (status) {
            query.status = status;
        }

        if (ownerId) {
            query.ownerId = ownerId;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Execute count and find in parallel
        const [total, gigs] = await Promise.all([
            Gig.countDocuments(query),
            Gig.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate('ownerId', 'name email')
                .populate('hiredFreelancerId', 'name email')
                .lean(),
        ]);

        const transformedGigs = await Promise.all(gigs.map((gig) => transformGig(gig)));

        return {
            gigs: transformedGigs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
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
            .populate('hiredFreelancerId', 'name email')
            .lean();

        if (!gig) {
            throw new Error('Gig not found');
        }

        return transformGig(gig);
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
            .populate('hiredFreelancerId', 'name email')
            .lean();

        return Promise.all(gigs.map((gig) => transformGig(gig)));
    }
}

export default new GigRepository();
export { GigStatus };
