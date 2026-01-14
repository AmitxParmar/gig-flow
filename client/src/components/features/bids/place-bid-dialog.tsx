import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateBid } from "@/hooks/useBids"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Gig } from "@/types/gig"
import { toast } from "sonner"

const bidSchema = z.object({
    price: z.coerce.number().min(1, "Price must be at least 1"),
    message: z.string().min(10, "Proposal must be at least 10 characters").max(500, "Proposal must be less than 500 characters"),
})

type BidFormValues = z.infer<typeof bidSchema>

interface PlaceBidDialogProps {
    gig: Gig
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PlaceBidDialog({ gig, open, onOpenChange }: PlaceBidDialogProps) {
    const { mutate: createBid, isPending } = useCreateBid()

    const form = useForm<BidFormValues>({
        resolver: zodResolver(bidSchema) as unknown as Resolver<BidFormValues>,
        defaultValues: {
            price: gig.budget,
            message: "",
        },
    })

    const onSubmit = (data: BidFormValues) => {
        createBid(
            {
                gigId: gig._id,
                ...data,
            },
            {
                onSuccess: () => {
                    toast.success("Bid placed successfully!")
                    onOpenChange(false)
                    form.reset()
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Failed to place bid")
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Place a Bid</DialogTitle>
                    <DialogDescription>
                        Submit your proposal for "{gig.title}". The client will review your bid.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bid Amount ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proposal</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Introduce yourself and explain why you're a good fit..."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Placing Bid..." : "Submit Bid"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
