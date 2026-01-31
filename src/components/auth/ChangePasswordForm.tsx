'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { toast } from 'sonner'
import { checkPasswordBreach } from '@/lib/password-security'

interface ChangePasswordFormProps {
  userRole?: 'admin' | 'employee'
}

export function ChangePasswordForm({ userRole = 'admin' }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  // Memoize the Supabase client to avoid creating new instances on every render
  const supabase = useMemo(() => createClient(), [])

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPassword = form.watch('newPassword')

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setIsLoading(true)

    try {
      // Get current user to verify credentials
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user || !user.email) {
        toast.error('Benutzer nicht gefunden. Bitte melden Sie sich erneut an.')
        setIsLoading(false)
        return
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      })

      if (signInError) {
        toast.error('Das aktuelle Passwort ist falsch.')
        setIsLoading(false)
        return
      }

      // Check new password against HIBP breach database
      const breachCheck = await checkPasswordBreach(values.newPassword)
      if (breachCheck.isBreached) {
        toast.error(
          'Dieses Passwort wurde in Datenlecks gefunden. Bitte wählen Sie ein anderes.'
        )
        setIsLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      })

      if (updateError) {
        toast.error(updateError.message || 'Passwort konnte nicht geändert werden')
        setIsLoading(false)
        return
      }

      // Success - reset form and show success message
      form.reset()
      toast.success('Passwort erfolgreich geändert!')

    } catch {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            {...form.register('currentPassword')}
          />
          {form.formState.errors.currentPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Neues Passwort</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            {...form.register('newPassword')}
          />
          {form.formState.errors.newPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.newPassword.message}
            </p>
          )}
          {newPassword && (
            <PasswordStrengthIndicator password={newPassword} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Passwort wird geändert...' : 'Passwort ändern'}
      </Button>
    </form>
  )
}
