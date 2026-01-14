import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// Ensure the import path is correct based on where CreateGigDialog is located
import { CreateGigDialog } from "@/components/dashboard/create-gig-dialog"

interface PostGigButtonProps {
    mobile?: boolean
}

export function PostGigButton({ mobile }: PostGigButtonProps) {
    return (
        <CreateGigDialog>
            <Button className={cn("gap-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all", mobile ? "h-10 w-10 p-0" : "w-full")}>
                <Plus className="h-5 w-5" />
                <span className={cn(mobile ? "hidden" : "hidden lg:inline")}>Post a Gig</span>
            </Button>
        </CreateGigDialog>
    )
}