import { z } from "zod"

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Der Vorlagenname muss mindestens 2 Zeichen lang sein")
    .max(100, "Der Vorlagenname darf maximal 100 Zeichen lang sein"),
  description: z
    .string()
    .max(500, "Die Beschreibung darf maximal 500 Zeichen lang sein")
    .optional()
    .or(z.literal("")),
})

export const updateTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Der Vorlagenname muss mindestens 2 Zeichen lang sein")
    .max(100, "Der Vorlagenname darf maximal 100 Zeichen lang sein"),
  description: z
    .string()
    .max(500, "Die Beschreibung darf maximal 500 Zeichen lang sein")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().optional(),
})

export const createChecklistItemSchema = z.object({
  title: z
    .string()
    .min(1, "Titel des Elements ist erforderlich")
    .max(200, "Der Titel darf maximal 200 Zeichen lang sein"),
  description: z
    .string()
    .max(500, "Die Beschreibung darf maximal 500 Zeichen lang sein")
    .optional()
    .or(z.literal("")),
  item_type: z.enum(["checkbox", "text", "number", "photo_only"], {
    message: "Bitte wählen Sie einen Elementtyp aus",
  }),
  requires_photo: z.boolean().optional().default(false),
  requires_note: z.boolean().optional().default(false),
  sort_order: z.number().int().min(0).optional().default(0),
  parent_id: z.string().uuid().optional().nullable(),
})

export const updateChecklistItemSchema = z.object({
  title: z
    .string()
    .min(1, "Titel des Elements ist erforderlich")
    .max(200, "Der Titel darf maximal 200 Zeichen lang sein"),
  description: z
    .string()
    .max(500, "Die Beschreibung darf maximal 500 Zeichen lang sein")
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
