import { type Bid, type BidStatus, type Prisma } from '@prisma/client';
import prismaClient from '@/lib/prisma';
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

export interface BidWithRelations extends Bid {
    freelancer: {
        id: string;
        name: string;
        email: string;
    };
    gig: {
        id: string;
        title: string;
        budget: number;
        status: string;
        ownerId: string;
        owner: {
            id: string;
            name: string;
            email: string;
        };
    };
}

class BidRepository {
    /**
     * Create a new bid
     */
    async createBid(data: CreateBidData): Promise<BidWithRelations> {
        logger.info(`Creating bid for gig ${data.gigId} by freelancer ${data.freelancerId}`);

        const bid = await prismaClient.bid.create({
            data: {
                gigId: data.gigId,
                freelancerId: data.freelancerId,
                message: data.message,
                price: data.price,
            },
            include: {
                freelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                gig: {
                    select: {
                        id: true,
                        title: true,
                        budget: true,
                        status: true,
                        ownerId: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return bid;
    }

    /**
     * Find a bid by ID with relations
     */
    async findBidById(id: string): Promise<BidWithRelations | null> {
        const bid = await prismaClient.bid.findUnique({
            where: { id },
            include: {
                freelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                gig: {
                    select: {
                        id: true,
                        title: true,
                        budget: true,
                        status: true,
                        ownerId: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return bid;
    }

    /**
     * Find all bids for a specific gig
     */
    async findBidsByGigId(gigId: string): Promise<BidWithRelations[]> {
        const bids = await prismaClient.bid.findMany({
            where: { gigId },
            orderBy: { createdAt: 'desc' },
            include: {
                freelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                gig: {
                    select: {
                        id: true,
                        title: true,
                        budget: true,
                        status: true,
                        ownerId: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return bids;
    }

    /**
     * Find all bids placed by a specific freelancer
     */
    async findBidsByFreelancerId(freelancerId: string): Promise<BidWithRelations[]> {
        const bids = await prismaClient.bid.findMany({
            where: { freelancerId },
            orderBy: { createdAt: 'desc' },
            include: {
                freelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                gig: {
                    select: {
                        id: true,
                        title: true,
                        budget: true,
                        status: true,
                        ownerId: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return bids;
    }

    /**
     * Update a bid by ID
     */
    async updateBid(id: string, data: UpdateBidData): Promise<BidWithRelations> {
        logger.info(`Updating bid: ${id}`);

        const bid = await prismaClient.bid.update({
            where: { id },
            data,
            include: {
                freelancer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                gig: {
                    select: {
                        id: true,
                        title: true,
                        budget: true,
                        status: true,
                        ownerId: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return bid;
    }

    /**
     * Update bid status
     */
    async updateBidStatus(id: string, status: BidStatus): Promise<Bid> {
        logger.info(`Updating bid ${id} status to ${status}`);

        return prismaClient.bid.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Reject all other bids for a gig (except the hired one)
     * Used during the hiring process
     */
    async rejectOtherBids(gigId: string, hiredBidId: string): Promise<number> {
        logger.info(`Rejecting all bids for gig ${gigId} except ${hiredBidId}`);

        const result = await prismaClient.bid.updateMany({
            where: {
                gigId,
                id: { not: hiredBidId },
                status: 'PENDING',
            },
            data: { status: 'REJECTED' },
        });

        return result.count;
    }

    /**
     * Check if freelancer already bid on this gig
     */
    async findExistingBid(gigId: string, freelancerId: string): Promise<Bid | null> {
        return prismaClient.bid.findUnique({
            where: {
                gigId_freelancerId: {
                    gigId,
                    freelancerId,
                },
            },
        });
    }

    /**
     * Get all pending bids for a gig (for rejection notifications)
     */
    async findPendingBidsForGig(gigId: string, excludeBidId?: string): Promise<Bid[]> {
        return prismaClient.bid.findMany({
            where: {
                gigId,
                status: 'PENDING',
                ...(excludeBidId && { id: { not: excludeBidId } }),
            },
        });
    }
}

export default new BidRepository();
