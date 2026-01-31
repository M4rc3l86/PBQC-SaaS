import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/UserMenu'
import { MobileUserMenu } from '@/components/auth/MobileUserMenu'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function EmployeeSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with company data
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `
      *,
      company:companies(*)
    `
    )
    .eq('id', user.id)
    .single()

  // Verify user is employee
  if (!profile || profile.role !== 'employee') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/employee" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              PB
            </div>
            PBQC
          </Link>

          <MobileUserMenu />
          <UserMenu />
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <div className="mb-8">
          <Link href="/employee">
            <Button variant="ghost" className="gap-2 px-0 mb-4">
              ← Zurück zum Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            Einstellungen
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Verwalten Sie Ihre Kontoeinstellungen
          </p>
        </div>

        {/* Settings cards */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
              <CardDescription>
                Ändern Sie Ihr Passwort, um Ihr Konto zu schützen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm userRole="employee" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
