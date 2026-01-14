import { memo } from "react"
import { GigCard } from "./gig-card"
import { type Gig } from "@/types/gig"

interface GigListProps {
    gigs: Gig[]
    view?: "grid" | "list"
    onLoadMore?: () => void
    hasNextPage?: boolean
    isFetchingNextPage?: boolean
    action?: 'bid' | 'details'
}

export const GigList = memo(function GigList({
    gigs,
    view = "grid",
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    action = 'bid'
}: GigListProps) {
    return (
        <div className="space-y-6">
            {view === "list" ? (
                <div className="space-y-3">
                    {gigs.map((gig) => (
                        <div key={gig.id} className="flex items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div>{gig.title}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {gigs.map((gig) => (
                        <GigCard key={gig.id} gig={gig} action={action} />
                    ))}
                </div>
            )}

            {hasNextPage && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={onLoadMore}
                        disabled={isFetchingNextPage}
                        className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    )
})
