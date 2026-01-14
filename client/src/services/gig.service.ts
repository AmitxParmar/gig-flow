import api from '@/lib/api-client';
import type { ApiResponse } from '@/types/common.types';
import type { Gig, CreateGigDto, UpdateGigDto, GigQuery, GigPaginatedResponse } from '@/types/gig';

export const gigService = {
    /**
     * GET /gigs
     * Get all gigs with optional filtering
     */
    getAll: async (params?: GigQuery): Promise<GigPaginatedResponse> => {
        const response = await api.get<ApiResponse<GigPaginatedResponse>>('/gigs', { params });
        return response.data.data;
    },

    /**
     * GET /gigs/my
     * Get current user's posted gigs
     */
    getMyGigs: async (params?: GigQuery): Promise<GigPaginatedResponse> => {
        const response = await api.get<ApiResponse<GigPaginatedResponse>>('/gigs/my', { params });
        return response.data.data;
    },

    /**
     * GET /gigs/:id
     * Get a single gig by ID
     */
    getById: async (id: string): Promise<Gig> => {
        const response = await api.get<ApiResponse<Gig>>(`/gigs/${id}`);
        return response.data.data;
    },

    /**
     * POST /gigs
     * Create a new gig
     */
    create: async (data: CreateGigDto): Promise<Gig> => {
        const response = await api.post<ApiResponse<Gig>>('/gigs', data);
        return response.data.data;
    },

    /**
     * PUT /gigs/:id
     * Update a gig
     */
    update: async (id: string, data: UpdateGigDto): Promise<Gig> => {
        const response = await api.put<ApiResponse<Gig>>(`/gigs/${id}`, data);
        return response.data.data;
    },

    /**
     * DELETE /gigs/:id
     * Delete a gig
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`/gigs/${id}`);
    },
};
