import { z } from 'zod'

export const roleSchema = z.enum(['admin', 'employee'], {
  message: 'Bitte wählen Sie eine Rolle aus',
})

export const statusSchema = z.enum(['active', 'inactive'])

// Schema for creating a new employee (admin only)
export const createEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Der Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  role: z.literal('employee'),
})

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>

// Schema for editing an employee
export const editEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Der Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  role: roleSchema,
})

export type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>

// Schema for updating own profile
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Der Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>

// Schema for first-time onboarding
export const onboardingSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein')
      .regex(/[A-Z]/, 'Das Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(/[a-z]/, 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten')
      .regex(/[0-9]/, 'Das Passwort muss mindestens eine Zahl enthalten'),
    confirmPassword: z.string().min(1, 'Bitte bestätigen Sie Ihr Passwort'),
    fullName: z.string().min(2, 'Der Name muss mindestens 2 Zeichen lang sein'),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

// Schema for employee list query parameters
export const employeeListQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
})

export type EmployeeListQueryValues = z.infer<typeof employeeListQuerySchema>
