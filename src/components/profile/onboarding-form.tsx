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
  Form,
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
      phone: '',
    },
  })

  const onSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Sie müssen angemeldet sein')
        return
      }

      // Get full_name from auth metadata (set during registration)
      const fullName = user.user_metadata.full_name || user.user_metadata.fullName || ''

      // Update profile with full_name from metadata and phone number
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
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
    </Form>
  )
}
