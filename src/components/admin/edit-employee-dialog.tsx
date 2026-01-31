'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmployeeForm } from './employee-form'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { EditEmployeeFormValues } from '@/lib/validations/users'
import type { Tables } from '@/types/database'

type Profile = Tables<'profiles'>

interface EditEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Profile | null
  onSuccess?: () => void
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EditEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  // Reset form when employee changes
  useEffect(() => {
    if (!open) return
  }, [employee, open])

  const handleSubmit = async (values: EditEmployeeFormValues) => {
    if (!employee) return

    setIsSubmitting(true)

    try {
      // Check if email is being changed (requires backend API)
      if (values.email !== employee.email) {
        const emailResponse = await fetch('/api/users/update-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: employee.id,
            newEmail: values.email,
          }),
        })

        const emailData = await emailResponse.json()

        if (!emailResponse.ok) {
          toast.error(emailData.message || 'Fehler beim Aktualisieren der E-Mail-Adresse')
          return
        }
      }

      // Update profile (works via RLS)
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          role: values.role,
        })
        .eq('id', employee.id)

      if (error) {
        toast.error(error.message || 'Fehler beim Aktualisieren des Mitarbeiters')
        return
      }

      toast.success('Mitarbeiter erfolgreich aktualisiert!')
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
        </DialogHeader>
        <EmployeeForm
          mode="edit"
          defaultValues={{
            fullName: employee.full_name,
            email: employee.email,
            role: employee.role as 'admin' | 'employee',
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          canEditRole={employee.id !== employee.id} // Can't edit own role
        />
      </DialogContent>
    </Dialog>
  )
}
