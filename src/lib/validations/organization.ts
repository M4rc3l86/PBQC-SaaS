import { z } from "zod"

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Der Organisationsname muss mindestens 2 Zeichen lang sein")
    .max(100, "Der Organisationsname darf maximal 100 Zeichen lang sein"),
})

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Der Organisationsname muss mindestens 2 Zeichen lang sein")
    .max(100, "Der Organisationsname darf maximal 100 Zeichen lang sein"),
})

export const inviteMemberSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  role: z.enum(["manager", "worker"], {
    message: "Bitte wählen Sie eine Rolle aus",
  }),
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(["owner", "manager", "worker"], {
    message: "Bitte wählen Sie eine Rolle aus",
  }),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
