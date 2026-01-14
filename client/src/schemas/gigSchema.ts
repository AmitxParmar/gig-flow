import * as z from "zod"

export const createGigSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must not exceed 100 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must not exceed 2000 characters"),
    budget: z.coerce.number().min(1, "Budget must be a positive number"),
})

export type CreateGigFormValues = z.infer<typeof createGigSchema>

export const updateGigSchema = createGigSchema.partial()
