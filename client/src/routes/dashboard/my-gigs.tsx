import { createFileRoute } from '@tanstack/react-router'
import { GigList } from "@/components/features/gigs/gig-list"
import { useMyGigs } from '@/hooks/useGigs'

export const Route = createFileRoute('/dashboard/my-gigs')({
    component: DashboardMyGigsPage,
})

function DashboardMyGigsPage() {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useMyGigs()

    const gigList = data?.pages.flatMap((page) => page.gigs) || []

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex h-full items-center justify-center min-h-[50vh] text-red-500">
                Error loading my gigs data. Please try again.
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">My Gigs</h2>
                <GigList
                    gigs={gigList}
                    onLoadMore={() => fetchNextPage()}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    action="details"
                />
            </div>
        </div>
    )
}
