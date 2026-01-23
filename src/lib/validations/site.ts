import { z } from "zod"

export const createSiteSchema = z.object({
  name: z
    .string()
    .min(2, "Site name must be at least 2 characters")
    .max(100, "Site name must be less than 100 characters"),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  timezone: z.string().default("Europe/Berlin"),
})

export const updateSiteSchema = z.object({
  name: z
    .string()
    .min(2, "Site name must be at least 2 characters")
    .max(100, "Site name must be less than 100 characters"),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  timezone: z.string(),
  is_active: z.boolean().optional(),
})

export type CreateSiteInput = z.infer<typeof createSiteSchema>
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>
