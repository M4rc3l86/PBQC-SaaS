import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/types/database'

type Profile = Tables<'profiles'>

interface EmployeeStatusBadgeProps {
  status: Profile['status']
}

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return status === 'active' ? (
    <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
      Aktiv
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-muted-foreground">
      Inaktiv
    </Badge>
  )
}
