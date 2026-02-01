'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Tables } from '@/types/database'
import { AlertCircle } from 'lucide-react'

type Profile = Tables<'profiles'>

interface DeactivateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Profile | null
  onConfirm: () => void
  isSubmitting?: boolean
  error?: string | null
}

export function DeactivateDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isSubmitting = false,
  error = null,
}: DeactivateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitarbeiter deaktivieren</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie <strong>{employee?.full_name}</strong> deaktivieren
            möchten? Der Mitarbeiter kann sich nicht mehr anmelden, aber alle Daten bleiben
            erhalten.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wird deaktiviert...' : 'Deaktivieren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
