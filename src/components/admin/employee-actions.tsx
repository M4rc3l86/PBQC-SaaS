'use client'

import { Button } from '@/components/ui/button'
import {
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  Key,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Tables } from '@/types/database'

type Profile = Tables<'profiles'>

interface EmployeeActionsProps {
  employee: Profile
  onEdit: () => void
  onToggleStatus: () => void
  onResetPassword: () => void
  isUpdating?: boolean
}

export function EmployeeActions({
  employee,
  onEdit,
  onToggleStatus,
  onResetPassword,
  isUpdating = false,
}: EmployeeActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleStatus}>
          {employee.status === 'active' ? (
            <>
              <PowerOff className="mr-2 h-4 w-4" />
              Deaktivieren
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              Reaktivieren
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onResetPassword}>
          <Key className="mr-2 h-4 w-4" />
          Passwort zurücksetzen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
