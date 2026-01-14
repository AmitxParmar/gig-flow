import api from '@/lib/api-client';
import type { ApiResponse } from '@/types/common.types';
import type { Bid, CreateBidDto, UpdateBidDto } from '@/types/bid';

export const bidService = {
    /**
     * GET /bids/:gigId
     * Get all bids for a specific gig (owner only)
     */
    getByGigId: async (gigId: string): Promise<Bid[]> => {
        const response = await api.get<ApiResponse<Bid[]>>(`/bids/${gigId}`);
        return response.data.data;
    },

    /**
     * GET /bids/my
     * Get all bids placed by the current user
     */
    getMyBids: async (): Promise<Bid[]> => {
        const response = await api.get<ApiResponse<Bid[]>>('/bids/my');
        return response.data.data;
    },

    /**
     * POST /bids
     * Place a bid on a gig
     */
    create: async (data: CreateBidDto): Promise<Bid> => {
        const response = await api.post<ApiResponse<Bid>>('/bids', data);
        return response.data.data;
    },

    /**
     * PUT /bids/:id
     * Update a bid (freelancer only)
     */
    update: async (id: string, data: UpdateBidDto): Promise<Bid> => {
        const response = await api.put<ApiResponse<Bid>>(`/bids/${id}`, data);
        return response.data.data;
    },

    /**
     * PATCH /bids/:id/hire
     * Hire a freelancer (gig owner only)
     */
    hire: async (id: string): Promise<void> => {
        await api.patch(`/bids/${id}/hire`);
    },
};
