'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'
import { EmployeeStatusBadge } from './employee-status-badge'
import { EmployeeSearch } from './employee-search'
import { EmployeeActions } from './employee-actions'
import { CreateEmployeeDialog } from './create-employee-dialog'
import { EditEmployeeDialog } from './edit-employee-dialog'
import { DeactivateDialog } from './deactivate-dialog'
import { ReactivateDialog } from './reactivate-dialog'
import { ResetPasswordDialog } from './reset-password-dialog'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

// Password reset rate limiting constants
const RATE_LIMIT_KEY = 'password_reset_attempts'
const MAX_RESETS_PER_HOUR = 3
const HOUR_IN_MS = 60 * 60 * 1000

interface ResetAttempt {
  timestamp: number
  employeeId: string
}

// Get recent attempts for an employee (within last hour)
const getRecentAttempts = (employeeId: string): number => {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(RATE_LIMIT_KEY)
  if (!stored) return 0

  const attempts: ResetAttempt[] = JSON.parse(stored)
  const now = Date.now()

  const recentAttempts = attempts.filter(
    a => a.employeeId === employeeId && (now - a.timestamp) < HOUR_IN_MS
  )

  return recentAttempts.length
}

// Record a reset attempt
const recordResetAttempt = (employeeId: string) => {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(RATE_LIMIT_KEY)
  const attempts: ResetAttempt[] = stored ? JSON.parse(stored) : []

  const now = Date.now()
  const validAttempts = attempts.filter(a => (now - a.timestamp) < HOUR_IN_MS)

  validAttempts.push({ timestamp: now, employeeId })

  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(validAttempts))
}

// Get time until next reset is available
const getTimeUntilNextReset = (employeeId: string): string | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(RATE_LIMIT_KEY)
  if (!stored) return null

  const attempts: ResetAttempt[] = JSON.parse(stored)
  const now = Date.now()

  const employeeAttempts = attempts.filter(
    a => a.employeeId === employeeId && (now - a.timestamp) < HOUR_IN_MS
  )

  if (employeeAttempts.length < MAX_RESETS_PER_HOUR) return null

  const oldestAttempt = employeeAttempts
    .filter(a => (now - a.timestamp) < HOUR_IN_MS)
    .sort((a, b) => a.timestamp - b.timestamp)[0]

  if (!oldestAttempt) return null

  const timeUntilReset = HOUR_IN_MS - (now - oldestAttempt.timestamp)
  const minutes = Math.ceil(timeUntilReset / 60000)

  return `${minutes} Minute${minutes > 1 ? 'n' : ''}`
}

type Profile = Tables<'profiles'>

type StatusFilter = 'all' | 'active' | 'deactivated'

export function TeamList() {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)

  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)

  const supabase = createClient()

  const loadEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (!profile?.company_id) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmployees(data || [])
    } catch {
      toast.error('Fehler beim Laden der Mitarbeiter')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        search === '' ||
        employee.full_name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || employee.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [employees, search, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEmployees.slice(start, start + itemsPerPage)
  }, [filteredEmployees, currentPage])

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const handleEdit = (employee: Profile) => {
    setSelectedEmployee(employee)
    setEditDialogOpen(true)
  }

  const handleDeactivate = (employee: Profile) => {
    setSelectedEmployee(employee)
    setDeactivateDialogOpen(true)
  }

  const handleReactivate = (employee: Profile) => {
    setSelectedEmployee(employee)
    setReactivateDialogOpen(true)
  }

  const handleResetPassword = (employee: Profile) => {
    const attempts = getRecentAttempts(employee.id)

    if (attempts >= MAX_RESETS_PER_HOUR) {
      const timeUntil = getTimeUntilNextReset(employee.id)
      toast.error(
        `Zu viele Rücksetzungsversuche. Bitte versuchen Sie es in ${timeUntil} erneut.`
      )
      return
    }

    setSelectedEmployee(employee)
    setResetPasswordDialogOpen(true)
  }

  const confirmDeactivate = async () => {
    if (!selectedEmployee) return

    setIsUpdating(true)
    setDialogError(null)
    try {
      const response = await fetch('/api/users/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedEmployee.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        setDialogError(data.message || 'Fehler beim Deaktivieren des Mitarbeiters')
        return
      }

      toast.success('Mitarbeiter erfolgreich deaktiviert')
      setDeactivateDialogOpen(false)
      loadEmployees()
    } catch {
      toast.error('Fehler beim Deaktivieren des Mitarbeiters')
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmReactivate = async () => {
    if (!selectedEmployee) return

    setIsUpdating(true)
    setDialogError(null)
    try {
      const response = await fetch('/api/users/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedEmployee.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Fehler beim Reaktivieren des Mitarbeiters')
        return
      }

      toast.success('Mitarbeiter erfolgreich reaktiviert')
      setReactivateDialogOpen(false)
      loadEmployees()
    } catch {
      toast.error('Fehler beim Reaktivieren des Mitarbeiters')
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmResetPassword = async () => {
    if (!selectedEmployee) return

    setIsUpdating(true)
    try {
      // Use our API endpoint which generates link for manual sending
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedEmployee.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Fehler beim Generieren des Rücksetzlinks')
        return
      }

      // Record the attempt
      recordResetAttempt(selectedEmployee.id)

      toast.success('Passwort-Reset-Link wurde generiert (siehe Server-Konsole)')
      setResetPasswordDialogOpen(false)
    } catch {
      toast.error('Fehler beim Generieren des Rücksetzlinks')
    } finally {
      setIsUpdating(false)
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    pages.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    )

    if (showEllipsisStart) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (currentPage > 4) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (showEllipsisEnd) {
      if (currentPage < totalPages - 3) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      pages.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    pages.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    )

    return <PaginationContent>{pages}</PaginationContent>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Team verwalten</h2>
          <p className="text-muted-foreground">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Mitarbeiter' : 'Mitarbeiter'}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Mitarbeiter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <EmployeeSearch value={search} onChange={setSearch} />
        </div>
        <Select value={statusFilter} onValueChange={(v: StatusFilter) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="deactivated">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Users className="h-8 w-8 animate-pulse text-muted-foreground" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Keine Mitarbeiter gefunden</h3>
          <p className="mt-2 text-muted-foreground">
            {search || statusFilter !== 'all'
              ? 'Versuchen Sie, Ihre Filter anzupassen.'
              : 'Erstellen Sie Ihren ersten Mitarbeiter, um zu beginnen.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {paginatedEmployees.map((employee) => (
              <div key={employee.id} className="rounded-md border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{employee.full_name}</h3>
                    <p className="text-sm text-muted-foreground break-all">{employee.email}</p>
                  </div>
                  <EmployeeStatusBadge status={employee.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">Rolle:</span>{' '}
                    {employee.role === 'admin' ? 'Administrator' : 'Mitarbeiter'}
                  </span>
                  <span>
                    <span className="font-medium text-foreground">Letzte Anmeldung:</span>{' '}
                    {employee.last_login
                      ? formatDistanceToNow(new Date(employee.last_login), {
                          addSuffix: true,
                          locale: de,
                        })
                      : 'Noch nie'}
                  </span>
                </div>
                <div className="flex justify-end">
                  <EmployeeActions
                    employee={employee}
                    onEdit={() => handleEdit(employee)}
                    onToggleStatus={() =>
                      employee.status === 'active'
                        ? handleDeactivate(employee)
                        : handleReactivate(employee)
                    }
                    onResetPassword={() => handleResetPassword(employee)}
                    isUpdating={isUpdating && selectedEmployee?.id === employee.id}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-normal min-w-[150px]">E-Mail</TableHead>
                  <TableHead className="whitespace-nowrap">Rolle</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Letzte Anmeldung</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium whitespace-nowrap">{employee.full_name}</TableCell>
                    <TableCell className="whitespace-normal min-w-[150px]">{employee.email}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {employee.role === 'admin' ? 'Administrator' : 'Mitarbeiter'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <EmployeeStatusBadge status={employee.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {employee.last_login
                        ? formatDistanceToNow(new Date(employee.last_login), {
                            addSuffix: true,
                            locale: de,
                          })
                        : 'Noch nie'}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <EmployeeActions
                        employee={employee}
                        onEdit={() => handleEdit(employee)}
                        onToggleStatus={() =>
                          employee.status === 'active'
                            ? handleDeactivate(employee)
                            : handleReactivate(employee)
                        }
                        onResetPassword={() => handleResetPassword(employee)}
                        isUpdating={isUpdating && selectedEmployee?.id === employee.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>{renderPagination()}</Pagination>
        </div>
      )}

      {/* Dialogs */}
      <CreateEmployeeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadEmployees}
      />

      <EditEmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        employee={selectedEmployee}
        onSuccess={loadEmployees}
      />

      <DeactivateDialog
        open={deactivateDialogOpen}
        onOpenChange={(open) => {
          setDeactivateDialogOpen(open)
          if (!open) setDialogError(null)
        }}
        employee={selectedEmployee}
        onConfirm={confirmDeactivate}
        isSubmitting={isUpdating}
        error={dialogError}
      />

      <ReactivateDialog
        open={reactivateDialogOpen}
        onOpenChange={setReactivateDialogOpen}
        employee={selectedEmployee}
        onConfirm={confirmReactivate}
        isSubmitting={isUpdating}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        employee={selectedEmployee}
        onConfirm={confirmResetPassword}
        isSubmitting={isUpdating}
        remainingAttempts={selectedEmployee ? MAX_RESETS_PER_HOUR - getRecentAttempts(selectedEmployee.id) : undefined}
      />
    </div>
  )
}
