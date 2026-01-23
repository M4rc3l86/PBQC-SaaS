import { z } from "zod"

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters")
    .max(100, "Template name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
})

export const updateTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters")
    .max(100, "Template name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().optional(),
})

export const createChecklistItemSchema = z.object({
  title: z
    .string()
    .min(1, "Item title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  item_type: z.enum(["checkbox", "text", "number", "photo_only"], {
    message: "Please select an item type",
  }),
  requires_photo: z.boolean().default(false),
  requires_note: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
  parent_id: z.string().uuid().optional().nullable(),
})

export const updateChecklistItemSchema = z.object({
  title: z
    .string()
    .min(1, "Item title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  item_type: z.enum(["checkbox", "text", "number", "photo_only"]),
  requires_photo: z.boolean(),
  requires_note: z.boolean(),
  sort_order: z.number().int().min(0),
  parent_id: z.string().uuid().optional().nullable(),
})

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int().min(0),
    })
  ),
})

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>
