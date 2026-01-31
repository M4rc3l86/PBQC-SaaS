import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Der Firmenname muss mindestens 2 Zeichen lang sein'),
  adminName: z.string().min(2, 'Der Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z
    .string()
    .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein')
    .regex(/[A-Z]/, 'Das Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Das Passwort muss mindestens eine Zahl enthalten'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein')
      .regex(/[A-Z]/, 'Das Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(/[a-z]/, 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten')
      .regex(/[0-9]/, 'Das Passwort muss mindestens eine Zahl enthalten'),
    confirmPassword: z.string().min(1, 'Bitte bestätigen Sie Ihr Passwort'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Aktuelles Passwort ist erforderlich'),
    newPassword: z
      .string()
      .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein')
      .regex(/[A-Z]/, 'Das Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(/[a-z]/, 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten')
      .regex(/[0-9]/, 'Das Passwort muss mindestens eine Zahl enthalten'),
    confirmPassword: z.string().min(1, 'Bitte bestätigen Sie Ihr Passwort'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
