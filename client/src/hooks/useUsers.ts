
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/user.service'


/**
 * Query keys for user-related data.
 */
export const userKeys = {
    /** Key for all users. */
    all: ['users'] as const,
    /** Key for searching users with a specific query. */
    search: (query: string) => ['users', 'search', query] as const,
}


/**
 * Hook to fetch all users
 */
export function useUsers() {
    return useQuery({
        queryKey: userKeys.all,
        queryFn: () => userService.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

