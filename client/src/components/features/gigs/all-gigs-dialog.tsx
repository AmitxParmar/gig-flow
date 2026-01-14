import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GigList } from "./gig-list"
import { useMyGigs } from "@/hooks/useGigs"

interface AllGigsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AllGigsDialog({ open, onOpenChange }: AllGigsDialogProps) {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useMyGigs()

    const gigList = data?.pages.flatMap((page) => page.gigs) || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>All Gigs</DialogTitle>
                    <DialogDescription>
                        View and manage all your posted gigs
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <GigList
                            gigs={gigList}
                            onLoadMore={() => fetchNextPage()}
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                        />
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
