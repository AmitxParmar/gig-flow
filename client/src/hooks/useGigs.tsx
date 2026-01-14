import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { gigService } from '@/services/gig.service'
import type { GigQuery, CreateGigDto, UpdateGigDto, GigPaginatedResponse } from '@/types/gig'

export const gigKeys = {
    all: ['gigs'] as const,
    lists: () => [...gigKeys.all, 'list'] as const,
    list: (filters: GigQuery) => [...gigKeys.lists(), filters] as const,
    details: () => [...gigKeys.all, 'detail'] as const,
    detail: (id: string) => [...gigKeys.details(), id] as const,
    my: ['gigs', 'my'] as const,
}

export function useGigs(filters: GigQuery = { limit: 10 }) {
    return useInfiniteQuery({
        queryKey: gigKeys.list(filters),
        queryFn: ({ pageParam }) => gigService.getAll({ ...filters, cursor: pageParam as string }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage: GigPaginatedResponse) => lastPage.nextCursor,
    })
}

export function useMyGigs(filters: GigQuery = { limit: 10 }) {
    return useInfiniteQuery({
        queryKey: gigKeys.my,
        queryFn: ({ pageParam }) => gigService.getMyGigs({ ...filters, cursor: pageParam as string }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage: GigPaginatedResponse) => lastPage.nextCursor,
    })
}

export function useGig(id: string) {
    return useQuery({
        queryKey: gigKeys.detail(id),
        queryFn: () => gigService.getById(id),
        enabled: !!id,
    })
}

export function useCreateGig() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateGigDto) => gigService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
        },
    })
}

export function useUpdateGig() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateGigDto }) => gigService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
            queryClient.invalidateQueries({ queryKey: gigKeys.detail(data.id) })
        },
    })
}

export function useDeleteGig() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: gigService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
        },
    })
}
