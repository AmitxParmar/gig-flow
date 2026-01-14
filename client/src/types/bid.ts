import type { User } from './auth';
import type { Gig } from './gig';

export enum BidStatus {
    PENDING = 'PENDING',
    HIRED = 'HIRED',
    REJECTED = 'REJECTED',
}

export interface Bid {
    _id: string;
    message: string;
    price: number;
    status: BidStatus;
    gigId: string;
    freelancerId: string;
    createdAt: string;
    updatedAt: string;
    // Virtuals/Populated fields
    freelancer?: User;
    gig?: Gig;
}

export interface CreateBidDto {
    gigId: string;
    message: string;
    price: number;
}

export interface UpdateBidDto {
    message?: string;
    price?: number;
}
