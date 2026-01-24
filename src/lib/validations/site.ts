import { z } from "zod"

export const createSiteSchema = z.object({
  name: z
    .string()
    .min(2, "Der Standortname muss mindestens 2 Zeichen lang sein")
    .max(100, "Der Standortname darf maximal 100 Zeichen lang sein"),
  address: z
    .string()
    .max(500, "Die Adresse darf maximal 500 Zeichen lang sein")
    .optional()
    .or(z.literal("")),
  timezone: z.string().default("Europe/Berlin"),
})

export const updateSiteSchema = z.object({
  name: z
    .string()
    .min(2, "Der Standortname muss mindestens 2 Zeichen lang sein")
    .max(100, "Der Standortname darf maximal 100 Zeichen lang sein"),
  address: z
    .string()
    .max(500, "Die Adresse darf maximal 500 Zeichen lang sein")
    .optional()
    .or(z.literal("")),
  timezone: z.string(),
  is_active: z.boolean().optional(),
})

export type CreateSiteInput = z.infer<typeof createSiteSchema>
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>
