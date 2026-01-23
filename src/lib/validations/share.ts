import { z } from "zod"

export const createShareSchema = z.object({
  expires_in_days: z.number().int().min(1).max(30).default(7),
})

export const sendShareEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  message: z.string().max(500, "Message must be less than 500 characters").optional(),
})

export type CreateShareInput = z.infer<typeof createShareSchema>
export type SendShareEmailInput = z.infer<typeof sendShareEmailSchema>
