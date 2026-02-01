import { z } from 'zod'

export const roleSchema = z.enum(['admin', 'employee'], {
  message: 'Bitte wählen Sie eine Rolle aus',
})

export const statusSchema = z.enum(['active', 'deactivated'])

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

// Schema for first-time onboarding - only phone number needed
// Name and password are already set during registration
export const onboardingSchema = z.object({
  phone: z.string().min(1, 'Bitte geben Sie Ihre Telefonnummer ein'),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

// Schema for employee list query parameters
export const employeeListQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  status: z.enum(['all', 'active', 'deactivated']).default('all'),
})

export type EmployeeListQueryValues = z.infer<typeof employeeListQuerySchema>
