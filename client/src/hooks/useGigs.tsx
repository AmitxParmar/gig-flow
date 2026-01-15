import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { gigService } from '@/services/gig.service'
import type { GigQuery, CreateGigDto, UpdateGigDto, GigPaginatedResponse } from '@/types/gig'

/**
 * Query keys for gig-related data.
 */
export const gigKeys = {
    /** Key for all gigs. */
    all: ['gigs'] as const,
    /** Key for all gig lists. */
    lists: () => [...gigKeys.all, 'list'] as const,
    /** Key for a specific gig list with filters. */
    list: (filters: GigQuery) => [...gigKeys.lists(), filters] as const,
    /** Key for all gig details. */
    details: () => [...gigKeys.all, 'detail'] as const,
    /** Key for a specific gig's details. */
    detail: (id: string) => [...gigKeys.details(), id] as const,
    /** Key for gigs belonging to the current user. */
    my: ['gigs', 'my'] as const,
}

/**
 * Hook to fetch a paginated list of gigs based on filters.
 * Uses infinite query for scrolling/pagination.
 * 
 * @param filters - Query filters like limit, status, etc.
 * @returns The infinite query result for gigs.
 */
export function useGigs(filters: GigQuery = { limit: 10 }) {
    return useInfiniteQuery({
        queryKey: gigKeys.list(filters),
        queryFn: ({ pageParam }) => gigService.getAll({ ...filters, cursor: pageParam as string }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage: GigPaginatedResponse) => lastPage.nextCursor,
    })
}

/**
 * Hook to fetch a paginated list of gigs owned by the current user.
 * 
 * @param filters - Query filters like limit, status, etc.
 * @returns The infinite query result for the user's gigs.
 */
export function useMyGigs(filters: GigQuery = { limit: 10 }) {
    return useInfiniteQuery({
        queryKey: gigKeys.my,
        queryFn: ({ pageParam }) => gigService.getMyGigs({ ...filters, cursor: pageParam as string }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage: GigPaginatedResponse) => lastPage.nextCursor,
    })
}

/**
 * Hook to fetch details for a single gig.
 * 
 * @param id - The ID of the gig to fetch.
 * @returns The query result for the specified gig.
 */
export function useGig(id: string) {
    return useQuery({
        queryKey: gigKeys.detail(id),
        queryFn: () => gigService.getById(id),
        enabled: !!id,
    })
}

/**
 * Hook to create a new gig.
 * Automatically invalidates gig lists and the user's gig cache on success.
 * 
 * @returns The mutation object for creating a gig.
 */
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

/**
 * Hook to update an existing gig.
 * Automatically invalidates relevant gig caches on success.
 * 
 * @returns The mutation object for updating a gig.
 */
export function useUpdateGig() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateGigDto }) => gigService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
            queryClient.invalidateQueries({ queryKey: gigKeys.my })
            queryClient.invalidateQueries({ queryKey: gigKeys.detail(data._id) })
        },
    })
}

/**
 * Hook to delete a gig.
 * Automatically invalidates gig lists and the user's gig cache on success.
 * 
 * @returns The mutation object for deleting a gig.
 */
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
