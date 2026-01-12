
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { useDebounce } from './useDebounce'

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

/**
 * Hook to search users with debouncing
 * @param search - Search query string
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
export function useSearchUsers(search: string, debounceMs: number = 300) {
    const debouncedSearch = useDebounce(search, debounceMs)

    return useQuery({
        queryKey: userKeys.search(debouncedSearch),
        queryFn: () => userService.getAll(debouncedSearch || undefined),
        staleTime: 30 * 1000, // 30 seconds for search results
        enabled: true, // Always enabled, empty search returns all users
    })
}
