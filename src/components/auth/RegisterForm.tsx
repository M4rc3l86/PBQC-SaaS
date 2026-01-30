'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { toast } from 'sonner'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: '',
      adminName: '',
      email: '',
      password: '',
    },
  })

  const password = form.watch('password')

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email)
        .single()

      if (existingUser) {
        toast.error('Ein Konto mit dieser E-Mail existiert bereits')
        setIsLoading(false)
        return
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.adminName,
            company_name: values.companyName,
          },
        },
      })

      if (authError) {
        toast.error(authError.message || 'Konto konnte nicht erstellt werden')
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Create company and profile will be handled by database triggers
        // or backend logic. For now, we'll wait and then sign in.
        toast.success('Konto erfolgreich erstellt!')

        // Auto-login after successful registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })

        if (signInError) {
          toast.error('Konto erstellt, aber die automatische Anmeldung ist fehlgeschlagen. Bitte melden Sie sich manuell an.')
          router.push('/login')
          return
        }

        router.push('/admin')
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
          <Label htmlFor="companyName">Firmenname</Label>
          <Input
            id="companyName"
            placeholder="Muster AG"
            disabled={isLoading}
            {...form.register('companyName')}
          />
          {form.formState.errors.companyName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.companyName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminName">Ihr Name</Label>
          <Input
            id="adminName"
            placeholder="Max Mustermann"
            disabled={isLoading}
            {...form.register('adminName')}
          />
          {form.formState.errors.adminName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.adminName.message}
            </p>
          )}
        </div>

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
          <Label htmlFor="password">Passwort</Label>
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
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Konto wird erstellt...' : 'Konto erstellen'}
      </Button>

      <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
        Durch das Erstellen eines Kontos stimmen Sie unseren Nutzungsbedingungen und der
        Datenschutzrichtlinie zu.
      </p>
    </form>
  )
}
