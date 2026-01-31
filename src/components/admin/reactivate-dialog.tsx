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

type Profile = Tables<'profiles'>

interface ReactivateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Profile | null
  onConfirm: () => void
  isSubmitting?: boolean
}

export function ReactivateDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isSubmitting = false,
}: ReactivateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitarbeiter reaktivieren</DialogTitle>
          <DialogDescription>
            Möchten Sie <strong>{employee?.full_name}</strong> reaktivieren? Der Mitarbeiter
            kann sich wieder anmelden.
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
            {isSubmitting ? 'Wird reaktiviert...' : 'Reaktivieren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
