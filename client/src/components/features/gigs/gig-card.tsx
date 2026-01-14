import { useState, useMemo, memo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Pencil, DollarSign } from "lucide-react"
import { type Gig, GigStatus } from "@/types/gig"
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { EditGigDialog } from "./edit-gig-dialog"
import { PlaceBidDialog } from "../bids/place-bid-dialog"
import { GigDetailsDrawer } from "./gig-details-drawer"

interface GigCardProps {
    gig: Gig
    action?: 'bid' | 'details'
}

function timeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"
    return Math.floor(seconds) + " seconds ago"
}

export const GigCard = memo(function GigCard({ gig, action = 'bid' }: GigCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isBidOpen, setIsBidOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const createdAtAgo = useMemo(() => timeAgo(gig.createdAt), [gig.createdAt])
    const creatorInitial = useMemo(() => gig.owner?.name?.charAt(0) || 'U', [gig.owner?.name])

    const statusStyles = useMemo(() => {
        const isOpen = gig.status === GigStatus.OPEN
        return isOpen ? "bg-cyan-200/20" : "bg-slate-500/10"
    }, [gig.status])

    const isAssigned = gig.status === GigStatus.ASSIGNED

    return (
        <>
            <EditGigDialog
                gig={gig}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
            <PlaceBidDialog
                gig={gig}
                open={isBidOpen}
                onOpenChange={setIsBidOpen}
            />
            <GigDetailsDrawer
                gig={gig}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
            <div className="p-2 mx-auto capitalize border-l-8 border-l-gray-400 border bg-card/60 border-black/10 max-h-[360px] hover:border hover:border-r-8 hover:shadow-lg transition-all rounded-3xl w-full h-full min-h-[320px] justify-between group space-y-2 flex flex-col">
                <div className={`${statusStyles} border-2 border-black/5 h-4/5 min-h-[80%] max-h-[80%] rounded-2xl p-4 w-full flex flex-col relative justify-between`}>
                    <div className={`${!isAssigned ? "hidden " : "block "} absolute -rotate-45 inset-y-1/3 z-10 font-bold group-hover:hidden text-5xl bg-background/80 backdrop-blur-sm shadow-xl duration-700 transition-all rounded-xl px-4 py-2 text-green-600 border-4 border-green-600`}>
                        Filled!
                    </div>

                    <div className="flex flex-row justify-between items-center z-20">
                        <span className="text-sm rounded-full bg-background/70 border border-border shadow-sm text-center align-center w-fit flex flex-row items-center py-2 px-3 font-bold text-foreground">
                            <Clock className="w-4 h-4 align-baseline mr-2" />
                            <span>{createdAtAgo}</span>
                        </span>

                        <div
                            title="Edit Gig"
                            className="h-10 w-10 border-2 rounded-full border-background bg-background/50 hover:bg-background flex items-center justify-center cursor-pointer transition-colors"
                            onClick={() => setIsEditOpen(true)}
                        >
                            <Pencil className="h-4 w-4 text-foreground/80" />
                        </div>
                    </div>

                    <div className="mt-2 flex flex-row items-center justify-between z-20">
                        <div className="flex-1 pr-2">
                            <p className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {gig.owner?.name || "Unknown"}
                            </p>

                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <div className="cursor-pointer text-sm font-medium text-foreground/90 line-clamp-3 hover:text-foreground transition-colors">
                                        {gig.description}
                                    </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80 max-h-[300px] overflow-y-auto">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">Description</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {gig.description}
                                        </p>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {creatorInitial}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex justify-start overflow-hidden flex-row flex-wrap gap-1 py-4 font-bold">
                        {/* Budget Display using similar style to priority */}
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-700 shadow-sm hover:bg-green-500/20">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {gig.budget.toLocaleString()}
                        </span>

                        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow-sm ${gig.status === GigStatus.OPEN ? 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20' : 'bg-slate-500/10 text-slate-700 hover:bg-slate-500/20'}`}>
                            {gig.status}
                        </span>
                    </div>
                </div>

                <div className="px-4 pb-4 w-full">
                    <div className="flex flex-col gap-3">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2" title={gig.title}>
                            {gig.title}
                        </h3>
                        <div className="flex justify-between items-center mt-auto">
                            <div className="text-xs text-muted-foreground font-medium">
                                {gig.hiredFreelancer ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        Hired: {gig.hiredFreelancer.name}
                                    </span>
                                ) : (
                                    <span>No one hired yet</span>
                                )}
                            </div>
                            {action === 'details' ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-4 font-semibold shadow-sm ml-auto"
                                    onClick={() => setIsDetailsOpen(true)}
                                >
                                    Details
                                </Button>
                            ) : (
                                !gig.hiredFreelancer && gig.status === GigStatus.OPEN && (
                                    <Button
                                        size="sm"
                                        className="h-8 px-4 font-semibold shadow-sm ml-auto"
                                        onClick={() => setIsBidOpen(true)}
                                    >
                                        Bid Now
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})
