import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

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
import { useUpdateGig } from "@/hooks/useGigs"
import { type Gig } from "@/types/gig"
import { updateGigSchema } from "@/schemas/gigSchema"

type EditGigFormValues = z.infer<typeof updateGigSchema>

interface EditGigDialogProps {
    gig: Gig
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditGigDialog({ gig, open, onOpenChange }: EditGigDialogProps) {
    const { mutate: updateGig, isPending } = useUpdateGig()

    const form = useForm<EditGigFormValues>({
        resolver: zodResolver(updateGigSchema) as any,
        defaultValues: {
            title: gig.title,
            description: gig.description || "",
            budget: gig.budget,
        },
    })

    async function onSubmit(data: EditGigFormValues) {
        updateGig({
            id: gig.id,
            data: {
                title: data.title,
                description: data.description || "",
                budget: data.budget,
            }
        }, {
            onSuccess: () => {
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Gig</DialogTitle>
                    <DialogDescription>
                        Make changes to your gig.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            console.error("Form validation errors:", errors)
                        })}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Gig title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Gig details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
