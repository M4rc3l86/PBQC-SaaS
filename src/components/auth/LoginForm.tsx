'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)

    try {
      // Use browser client for authentication - this properly sets cookies
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          toast.error('Ungültige Anmeldedaten')
        } else if (authError.message.includes('Email not confirmed')) {
          toast.error('Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse')
        } else {
          toast.error(authError.message || 'Anmeldung fehlgeschlagen')
        }
        return
      }

      if (!authData.user) {
        toast.error('Anmeldung fehlgeschlagen')
        return
      }

      // Get profile to check role and status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        toast.error('Benutzerprofil konnte nicht geladen werden')
        return
      }

      if (profile.status === 'deactivated') {
        await supabase.auth.signOut()
        toast.error('Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie den Support.')
        return
      }

      // Update last_login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id)

      // Successful login - redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin')
        router.refresh()
      } else if (profile.role === 'employee') {
        router.push('/employee')
        router.refresh()
      } else {
        toast.error('Ungültige Benutzerrolle')
      }
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Passwort vergessen?
            </Link>
          </div>
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
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
      </Button>
    </form>
  )
}
