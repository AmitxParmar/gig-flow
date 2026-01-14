import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bidService } from '@/services/bid.service'
import type { CreateBidDto, UpdateBidDto } from '@/types/bid'

export const bidKeys = {
    all: ['bids'] as const,
    byGig: (gigId: string) => [...bidKeys.all, 'gig', gigId] as const,
    my: ['bids', 'my'] as const,
}

export function useBidsByGig(gigId: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: bidKeys.byGig(gigId),
        queryFn: () => bidService.getByGigId(gigId),
        enabled: options?.enabled ?? !!gigId,
    })
}

export function useMyBids() {
    return useQuery({
        queryKey: bidKeys.my,
        queryFn: bidService.getMyBids,
    })
}

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
