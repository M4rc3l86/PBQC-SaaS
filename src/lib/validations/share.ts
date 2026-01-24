import { z } from "zod"

export const createShareSchema = z.object({
  expires_in_days: z.number().int().min(1).max(30).default(7),
})

export const sendShareEmailSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  message: z.string().max(500, "Die Nachricht darf maximal 500 Zeichen lang sein").optional(),
})

export type CreateShareInput = z.infer<typeof createShareSchema>
export type SendShareEmailInput = z.infer<typeof sendShareEmailSchema>
