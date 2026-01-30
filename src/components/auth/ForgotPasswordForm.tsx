'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const FORGOT_PASSWORD_LIMIT_KEY = 'forgotPasswordAttempts'
const FORGOT_PASSWORD_LIMIT_DURATION = 60 * 60 * 1000 // 1 hour
const MAX_FORGOT_PASSWORD_ATTEMPTS = 3

function getForgotPasswordAttempts(): { count: number; lastAttempt: number } {
  if (typeof window === 'undefined') return { count: 0, lastAttempt: 0 }
  const data = localStorage.getItem(FORGOT_PASSWORD_LIMIT_KEY)
  if (!data) return { count: 0, lastAttempt: 0 }
  return JSON.parse(data)
}

function setForgotPasswordAttempts(count: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    FORGOT_PASSWORD_LIMIT_KEY,
    JSON.stringify({ count, lastAttempt: Date.now() })
  )
}

function isForgotPasswordRateLimited(): boolean {
  const { count, lastAttempt } = getForgotPasswordAttempts()
  if (count >= MAX_FORGOT_PASSWORD_ATTEMPTS) {
    const timePassed = Date.now() - lastAttempt
    if (timePassed < FORGOT_PASSWORD_LIMIT_DURATION) {
      return true
    }
    setForgotPasswordAttempts(0)
  }
  return false
}

function incrementForgotPasswordAttempts() {
  const { count } = getForgotPasswordAttempts()
  setForgotPasswordAttempts(count + 1)
}

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    if (isForgotPasswordRateLimited()) {
      toast.error('Zu viele Anfragen zum Zurücksetzen des Passworts. Bitte versuchen Sie es später erneut.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      incrementForgotPasswordAttempts()

      if (error) {
        toast.error(error.message || 'Rücksetz-E-Mail konnte nicht gesendet werden')
        return
      }

      setIsSuccess(true)
      toast.success('Wenn ein Konto mit dieser E-Mail existiert, wurde ein Rücksetzlink gesendet.')
    } catch {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">
            E-Mail prüfen
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Wir haben einen Rücksetzlink an Ihre E-Mail-Adresse gesendet.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsSuccess(false)}
        >
          Weitere E-Mail senden
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@firma.de"
            disabled={isLoading}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Wird gesendet...' : 'Rücksetzlink senden'}
      </Button>
    </form>
  )
}
