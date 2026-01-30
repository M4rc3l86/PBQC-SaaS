import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/UserMenu'

export default async function EmployeeDashboard() {
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
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              PB
            </div>
            PBQC
          </div>

          <UserMenu />
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            Willkommen, {profile.full_name || 'Mitarbeiter'}!
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Mitarbeiter-Portal {profile.company?.name || 'Ihr Unternehmens'}
          </p>
        </div>

        {/* Stats placeholder */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Zugewiesene Aufträge
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
                  0
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Ausstehende Überprüfungen
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
                  0
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                <svg
                  className="h-6 w-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions placeholder */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Meine Aufträge
          </h2>
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm dark:bg-zinc-900">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-zinc-950 dark:text-zinc-50">
              Noch keine Aufträge zugewiesen
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Wenn Ihr Administrator Ihnen Aufträge zuweist, werden sie hier angezeigt.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
