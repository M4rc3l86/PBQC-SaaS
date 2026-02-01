'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import type { EmailOtpType } from '@supabase/supabase-js'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { toast } from 'sonner'
import { checkPasswordBreach } from '@/lib/password-security'

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null) // null = checking, true = valid, false = invalid
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

  // Check if user is authenticated (has valid recovery token from email link)
  // First, try to extract and exchange tokens from URL hash fragment
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // First, check if we already have a session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        if (isMounted) setIsValidToken(true)
        return
      }

      // No session - check if there are tokens in the URL hash fragment
      // Recovery links use: #access_token=xxx&refresh_token=xxx&type=recovery
      // Invite links use: #token_hash=xxx&type=invite
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const tokenHash = hashParams.get('token_hash')
      const type = hashParams.get('type')

      if (accessToken && refreshToken) {
        // Recovery flow - exchange tokens directly for a session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (!sessionError && isMounted) {
          setIsValidToken(true)
          // Clean up the URL by removing the hash fragment
          window.history.replaceState({}, document.title, window.location.pathname)
          return
        }
      } else if (tokenHash && type) {
        // Invite flow - verify OTP with token_hash
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType,
        })

        if (!verifyError && isMounted) {
          setIsValidToken(true)
          // Clean up the URL by removing the hash fragment
          window.history.replaceState({}, document.title, window.location.pathname)
          return
        } else if (isMounted) {
          console.error('Token verification failed:', verifyError)
        }
      }

      // No session and couldn't establish one from tokens
      if (isMounted) {
        setIsValidToken(false)
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('error') === 'invalid_token') {
          toast.error('Ungültiger oder abgelaufener Rücksetzlink. Bitte fordern Sie einen neuen an.')
        } else {
          toast.error('Ungültiger Rücksetzlink. Bitte nutzen Sie den Link aus der E-Mail.')
        }
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!isValidToken) { // Covers both null (checking) and false (invalid)
      toast.error('Ungültiger Rücksetzlink.')
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      // Check password against HIBP breach database
      const breachCheck = await checkPasswordBreach(values.password)
      if (breachCheck.isBreached) {
        toast.error(
          'Dieses Passwort wurde in Datenlecks gefunden. Bitte wählen Sie ein anderes.'
        )
        setIsLoading(false)
        return
      }

      // For password reset from email, user is already authenticated via the recovery token
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        toast.error(error.message || 'Passwort konnte nicht zurückgesetzt werden')
        return
      }

      toast.success('Passwort erfolgreich zurückgesetzt!')

      // User is already authenticated via recovery token - get role for redirect
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()
        router.push(profile?.role === 'admin' ? '/admin' : '/employee')
        router.refresh()
      } else {
        router.push('/login') // Fallback
      }
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

  if (isValidToken === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Rücksetzlink wird überprüft...
          </p>
        </div>
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
            autoComplete="new-password"
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
        {isLoading ? 'Passwort wird überprüft...' : 'Passwort zurücksetzen'}
      </Button>
    </form>
  )
}
