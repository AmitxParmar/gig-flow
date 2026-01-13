import { type Gig, type GigStatus, type Prisma } from '@prisma/client';
import prismaClient from '@/lib/prisma';
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

export interface GigWithRelations extends Gig {
    owner: {
        id: string;
        name: string;
        email: string;
    };
    hiredFreelancer?: {
        id: string;
        name: string;
        email: string;
    } | null;
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

class GigRepository {
    /**
     * Create a new gig
     */
    async createGig(data: CreateGigData): Promise<GigWithRelations> {
        logger.info(`Creating gig: ${data.title} by user ${data.ownerId}`);

        const gig = await prismaClient.gig.create({
            data: {
                title: data.title,
                description: data.description,
                budget: data.budget,
                ownerId: data.ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                hiredFreelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        bids: true,
                    },
                },
            },
        });

        return gig;
    }

    /**
     * Find a gig by ID with relations
     */
    async findGigById(id: string): Promise<GigWithRelations | null> {
        const gig = await prismaClient.gig.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                hiredFreelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        bids: true,
                    },
                },
            },
        });

        return gig;
    }

    /**
     * Find all gigs with optional filtering, searching, and pagination
     */
    async findAllGigs(filters: GigFilters = {}): Promise<PaginatedGigs> {
        const { search, status, ownerId, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.GigWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (ownerId) {
            where.ownerId = ownerId;
        }

        if (search) {
            where.title = {
                contains: search,
                mode: 'insensitive',
            };
        }

        // Execute count and find in parallel
        const [total, gigs] = await Promise.all([
            prismaClient.gig.count({ where }),
            prismaClient.gig.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    hiredFreelancer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            bids: true,
                        },
                    },
                },
            }),
        ]);

        return {
            gigs,
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

        const gig = await prismaClient.gig.update({
            where: { id },
            data,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                hiredFreelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        bids: true,
                    },
                },
            },
        });

        return gig;
    }

    /**
     * Delete a gig by ID
     */
    async deleteGig(id: string): Promise<void> {
        logger.info(`Deleting gig: ${id}`);
        await prismaClient.gig.delete({
            where: { id },
        });
    }

    /**
     * Update gig status (used during hiring)
     */
    async updateGigStatus(
        id: string,
        status: GigStatus,
        hiredFreelancerId?: string
    ): Promise<Gig> {
        logger.info(`Updating gig ${id} status to ${status}`);

        return prismaClient.gig.update({
            where: { id },
            data: {
                status,
                ...(hiredFreelancerId && { hiredFreelancerId }),
            },
        });
    }

    /**
     * Check if gig has any bids
     */
    async gigHasBids(gigId: string): Promise<boolean> {
        const count = await prismaClient.bid.count({
            where: { gigId },
        });
        return count > 0;
    }

    /**
     * Get gigs created by a specific user
     */
    async findGigsByOwnerId(ownerId: string): Promise<GigWithRelations[]> {
        const gigs = await prismaClient.gig.findMany({
            where: { ownerId },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                hiredFreelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        bids: true,
                    },
                },
            },
        });

        return gigs;
    }
}

export default new GigRepository();
