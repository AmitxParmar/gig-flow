
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/common.types'
import type { User } from '@/types/task'



export const userService = {
    /**
     * Get all users, optionally filtered by search query
     */

    getAll: async (search?: string): Promise<User[]> => {
        const params = search ? { search } : undefined
        const response = await apiClient.get<ApiResponse<User[]>>('/users', { params })
        return response.data.data
    },
}
