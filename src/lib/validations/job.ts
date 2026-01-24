import { z } from "zod"

export const createJobSchema = z.object({
  site_id: z.string().uuid("Bitte wählen Sie einen Standort aus"),
  template_id: z.string().uuid("Bitte wählen Sie eine Vorlage aus"),
  assigned_to: z.string().uuid("Bitte wählen Sie einen Mitarbeiter aus").optional().nullable(),
  scheduled_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Bitte geben Sie ein gültiges Datum ein",
  }),
})

export const updateJobSchema = z.object({
  site_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  scheduled_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Bitte geben Sie ein gültiges Datum ein",
    })
    .optional(),
  status: z
    .enum([
      "scheduled",
      "in_progress",
      "submitted",
      "approved",
      "rejected",
      "cancelled",
    ])
    .optional(),
})

export const updateJobStatusSchema = z.object({
  status: z.enum([
    "scheduled",
    "in_progress",
    "submitted",
    "approved",
    "rejected",
    "cancelled",
  ]),
  review_comment: z.string().max(1000).optional(),
})

export const rejectJobSchema = z.object({
  review_comment: z
    .string()
    .min(10, "Bitte geben Sie einen Ablehnungsgrund an (mindestens 10 Zeichen)")
    .max(1000, "Der Kommentar darf maximal 1000 Zeichen lang sein"),
})

export const updateJobItemResultSchema = z.object({
  status: z.enum(["pass", "fail", "na", "pending"]),
  note: z.string().max(500, "Die Notiz darf maximal 500 Zeichen lang sein").optional().nullable(),
  number_value: z.number().optional().nullable(),
  text_value: z.string().max(500).optional().nullable(),
})

export const uploadJobPhotoSchema = z.object({
  item_id: z.string().uuid().optional().nullable(),
  caption: z.string().max(200, "Die Bildunterschrift darf maximal 200 Zeichen lang sein").optional(),
})

export const createJobCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Der Kommentar darf nicht leer sein")
    .max(1000, "Der Kommentar darf maximal 1000 Zeichen lang sein"),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>
export type RejectJobInput = z.infer<typeof rejectJobSchema>
export type UpdateJobItemResultInput = z.infer<typeof updateJobItemResultSchema>
export type UploadJobPhotoInput = z.infer<typeof uploadJobPhotoSchema>
export type CreateJobCommentInput = z.infer<typeof createJobCommentSchema>
