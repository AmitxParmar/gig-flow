import * as z from "zod"

export const createBidSchema = z.object({
    message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must not exceed 1000 characters"),
    price: z.coerce.number().min(1, "Price must be a positive number"),
    gigId: z.string().uuid("Invalid Gig ID"),
})

export type CreateBidFormValues = z.infer<typeof createBidSchema>

export const updateBidSchema = z.object({
    message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must not exceed 1000 characters").optional(),
    price: z.coerce.number().min(1, "Price must be a positive number").optional(),
})
