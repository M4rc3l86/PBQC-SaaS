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

const MAX_RESETS_PER_HOUR = 3

type Profile = Tables<'profiles'>

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Profile | null
  onConfirm: () => void
  isSubmitting?: boolean
  remainingAttempts?: number
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isSubmitting = false,
  remainingAttempts,
}: ResetPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passwort zurücksetzen</DialogTitle>
          <DialogDescription>
            Möchten Sie das Passwort für <strong>{employee?.email}</strong> zurücksetzen?
            Ein Rücksetzlink wird in der Server-Konsole protokolliert, die Sie dem Mitarbeiter
            manuell senden können.
            {remainingAttempts !== undefined && remainingAttempts < 3 && (
              <span className="text-amber-600 dark:text-amber-400 mt-2 block">
                Noch {remainingAttempts} von {MAX_RESETS_PER_HOUR} Rücksetzungen in dieser Stunde verfügbar.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
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
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wird generiert...' : 'Link generieren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
