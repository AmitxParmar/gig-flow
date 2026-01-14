import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { type Gig, GigStatus } from "@/types/gig"
import { Clock, DollarSign, Loader2, CheckCircle2 } from "lucide-react"
import { useBidsByGig, useHireBid } from "@/hooks/useBids"
import { BidStatus } from "@/types/bid"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface GigDetailsDrawerProps {
    gig: Gig
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GigDetailsDrawer({ gig, open, onOpenChange }: GigDetailsDrawerProps) {
    const { data: bids, isLoading, isError } = useBidsByGig(gig._id, { enabled: open })
    const { mutate: hireBid, isPending: isHiring } = useHireBid()

    const handleHire = (bidId: string) => {
        toast.promise(
            new Promise((resolve, reject) => {
                hireBid({ id: bidId, gigId: gig._id }, {
                    onSuccess: resolve,
                    onError: reject
                })
            }),
            {
                loading: 'Hiring freelancer...',
                success: 'Freelancer hired successfully!',
                error: 'Failed to hire freelancer',
            }
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle>{gig.title}</DrawerTitle>
                        <DrawerDescription>
                            Posted by {gig.owner?.name || "Unknown User"}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 pb-0 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Gig Info */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary/10 p-2.5 rounded-full">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Budget</p>
                                        <p className="text-lg font-bold">${gig.budget.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`p-2.5 rounded-full ${gig.status === GigStatus.OPEN ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                        <Clock className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</p>
                                        <p className="text-lg font-bold">{gig.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl">
                                <h4 className="text-sm font-semibold mb-2 text-foreground/80">Description</h4>
                                <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                                    {gig.description}
                                </p>
                            </div>
                        </div>

                        {/* Bids List */}
                        <div className="border-t pt-4">
                            <h4 className="text-base font-bold mb-4 flex items-center gap-2">
                                Bids
                                {bids && <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{bids.length}</span>}
                            </h4>

                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : isError ? (
                                <p className="text-sm text-red-500 text-center py-4 bg-red-50 rounded-lg">Failed to load bids.</p>
                            ) : !bids?.length ? (
                                <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
                                    <p className="text-sm text-muted-foreground">No bids placed yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bids.map((bid) => (
                                        <div key={bid._id} className="p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border">
                                                        <AvatarFallback className="text-xs bg-primary/5 text-primary">
                                                            {bid.freelancer?.name?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm">{bid.freelancer?.name || "Unknown Freelancer"}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Offered: <span className="font-medium text-foreground">${bid.price}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${bid.status === BidStatus.HIRED ? 'bg-green-100 text-green-700 border-green-200' :
                                                    bid.status === BidStatus.REJECTED ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                    {bid.status}
                                                </span>
                                            </div>

                                            <div className="text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg italic border-l-2 border-primary/20">
                                                "{bid.message}"
                                            </div>

                                            {/* Hire Button logic */}
                                            {gig.status === GigStatus.OPEN && bid.status === BidStatus.PENDING && (
                                                <div className="pt-1 flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleHire(bid._id)}
                                                        disabled={isHiring}
                                                        className="h-8 shadow-sm"
                                                    >
                                                        {isHiring ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                Hiring...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="mr-2 h-3 w-3" />
                                                                Hire Freelancer
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
