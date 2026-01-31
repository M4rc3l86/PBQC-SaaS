'use client'

import { useState, useEffect, useMemo } from 'react'
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
  const [isValidToken, setIsValidToken] = useState(true)
  // Memoize the Supabase client to avoid creating new instances on every render
  const supabase = useMemo(() => createClient(), [])

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = form.watch('password')

  // Check if user is authenticated (has valid recovery token)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        setIsValidToken(false)
        toast.error('Ungültiger oder abgelaufener Rücksetzlink. Bitte fordern Sie einen neuen an.')
        setTimeout(() => {
          router.push('/forgot-password')
        }, 3000)
      }
    }
    checkAuth()
  }, [router])

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!isValidToken) {
      toast.error('Ungültiger Rücksetzlink. Bitte fordern Sie einen neuen an.')
      router.push('/forgot-password')
      return
    }

    setIsLoading(true)

    try {
      // For password reset from email, user is already authenticated via the recovery token
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        toast.error(error.message || 'Passwort konnte nicht zurückgesetzt werden')
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

  if (!isValidToken) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">
          Ungültiger oder abgelaufener Rücksetzlink. Sie werden weitergeleitet...
        </p>
      </div>
    )
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
