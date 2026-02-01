'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmployeeForm } from './employee-form'
import { toast } from 'sonner'
import type { CreateEmployeeFormValues } from '@/lib/validations/users'

interface CreateEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: CreateEmployeeFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Fehler beim Erstellen des Mitarbeiters')
        return
      }

      toast.success(data.message || 'Mitarbeiter erfolgreich erstellt!')
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Mitarbeiter erstellen</DialogTitle>
        </DialogHeader>
        <EmployeeForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
