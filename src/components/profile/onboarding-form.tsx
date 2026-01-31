'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  onboardingSchema,
  type OnboardingFormValues,
} from '@/lib/validations/users'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { Loader2 } from 'lucide-react'

interface OnboardingFormProps {
  role: 'admin' | 'employee'
}

export function OnboardingForm({ role }: OnboardingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    },
  })

  const password = form.watch('password')

  const onSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Sie müssen angemeldet sein')
        return
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (passwordError) {
        toast.error(passwordError.message || 'Fehler beim Aktualisieren des Passworts')
        return
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          phone: values.phone || null,
        })
        .eq('id', user.id)

      if (profileError) {
        toast.error(profileError.message || 'Fehler beim Aktualisieren des Profils')
        return
      }

      toast.success('Willkommen! Ihr Profil wurde eingerichtet.')

      // Redirect to appropriate dashboard
      router.push(role === 'admin' ? '/admin' : '/employee')
    } catch {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Voller Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Max Mustermann"
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefon (optional)</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="+49 123 456789"
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passwort</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
            {password && <PasswordStrengthIndicator password={password} />}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passwort bestätigen</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird eingerichtet...
          </>
        ) : (
          'Profil einrichten'
        )}
      </Button>
    </form>
  )
}
