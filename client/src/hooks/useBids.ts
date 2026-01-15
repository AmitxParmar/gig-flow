import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bidService } from '@/services/bid.service'
import type { CreateBidDto, UpdateBidDto } from '@/types/bid'

/**
 * Query keys for bid-related data.
 */
export const bidKeys = {
    /** Key for all bids. */
    all: ['bids'] as const,
    /** Key for bids associated with a specific gig. */
    byGig: (gigId: string) => [...bidKeys.all, 'gig', gigId] as const,
    /** Key for bids belonging to the current user. */
    my: ['bids', 'my'] as const,
}

/**
 * Hook to fetch all bids for a specific gig.
 * 
 * @param gigId - The ID of the gig to fetch bids for.
 * @param options - Optional query configuration.
 * @returns The query result containing bids for the gig.
 */
export function useBidsByGig(gigId: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: bidKeys.byGig(gigId),
        queryFn: () => bidService.getByGigId(gigId),
        enabled: options?.enabled ?? !!gigId,
    })
}

/**
 * Hook to fetch all bids made by the current user.
 * 
 * @returns The query result containing the current user's bids.
 */
export function useMyBids() {
    return useQuery({
        queryKey: bidKeys.my,
        queryFn: bidService.getMyBids,
    })
}

/**
 * Hook to create a new bid on a gig.
 * Automatically invalidates relevant bid queries on success.
 * 
 * @returns The mutation object for creating a bid.
 */
export function useCreateBid() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateBidDto) => bidService.create(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: bidKeys.byGig(data.gigId) })
            queryClient.invalidateQueries({ queryKey: bidKeys.my })
        },
    })
}

/**
 * Hook to update an existing bid.
 * Automatically invalidates relevant bid queries on success.
 * 
 * @returns The mutation object for updating a bid.
 */
export function useUpdateBid() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBidDto }) => bidService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: bidKeys.byGig(data.gigId) })
            queryClient.invalidateQueries({ queryKey: bidKeys.my })
        },
    })
}

/**
 * Hook to hire a freelancer via their bid.
 * Automatically invalidates relevant bid and gig queries on success.
 * 
 * @returns The mutation object for hiring a bid.
 */
export function useHireBid() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: string, gigId: string }) => bidService.hire(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: bidKeys.byGig(variables.gigId) })
            // Invalidate gig details as status changes
            queryClient.invalidateQueries({ queryKey: ['gigs', 'detail', variables.gigId] })
            // Also invalidate lists as status might be filtered
            queryClient.invalidateQueries({ queryKey: ['gigs', 'list'] })
            queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
        },
    })
}

