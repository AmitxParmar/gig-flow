import type { User } from './auth';

export enum GigStatus {
    OPEN = 'OPEN',
    ASSIGNED = 'ASSIGNED',
}

export interface Gig {
    _id: string;
    title: string;
    description: string;
    budget: number;
    status: GigStatus;
    ownerId: string | User; // Can be populated
    hiredFreelancerId?: string | User | null; // Can be populated
    createdAt: string;
    updatedAt: string;
    // Virtuals/Populated fields (legacy, may not be used if ownerId/hiredFreelancerId are populated)
    owner?: User;
    hiredFreelancer?: User;
    bids?: any[]; // Avoiding circular dependency for now, or could use Bid type if moved to a shared file or imported carefully
}

export interface CreateGigDto {
    title: string;
    description: string;
    budget: number;
}

export interface UpdateGigDto {
    title?: string;
    description?: string;
    budget?: number;
}

export interface GigQuery {
    search?: string;
    status?: GigStatus;
    cursor?: string;
    limit?: number;
}

export interface GigPaginatedResponse {
    gigs: Gig[];
    nextCursor: string | null;
}
