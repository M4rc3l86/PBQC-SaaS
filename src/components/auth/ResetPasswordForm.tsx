'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { toast } from 'sonner'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = form.watch('password')

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        // Check if the error is due to an expired or invalid link
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
          toast.error('Dieser Rücksetzlink ist abgelaufen oder ungültig. Bitte fordern Sie einen neuen an.')
          setTimeout(() => {
            router.push('/forgot-password')
          }, 2000)
        } else {
          toast.error(error.message || 'Passwort konnte nicht zurückgesetzt werden')
        }
        return
      }

      toast.success('Passwort erfolgreich zurückgesetzt!')
      router.push('/login')
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
          <Label htmlFor="password">Neues Passwort</Label>
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
          {password && (
            <PasswordStrengthIndicator password={password} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
          <Input
            id="confirmPassword"
            type="password"
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
        {isLoading ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
      </Button>
    </form>
  )
}
