
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/user.service'


export const userKeys = {
    all: ['users'] as const,
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

