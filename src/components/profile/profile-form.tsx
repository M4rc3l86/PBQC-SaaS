'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
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

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          toast.error('Sie müssen angemeldet sein')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          form.reset({
            fullName: profile.full_name,
            email: profile.email,
            phone: profile.phone || '',
          })
        }
      } catch {
        toast.error('Fehler beim Laden des Profils')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase, form])

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Sie müssen angemeldet sein')
        return
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          email: values.email,
          phone: values.phone || null,
        })
        .eq('id', user.id)

      if (error) {
        toast.error(error.message || 'Fehler beim Aktualisieren des Profils')
        return
      }

      // Update email in auth if changed
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      if (values.email !== currentProfile?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        })

        if (emailError) {
          toast.error('E-Mail wurde aktualisiert, aber eine Bestätigung ist erforderlich')
          return
        }
      }

      toast.success('Profil erfolgreich aktualisiert!')
    } catch {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-Mail</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="name@firma.de"
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            'Änderungen speichern'
          )}
        </Button>
      </div>
      </form>
    </Form>
  )
}
