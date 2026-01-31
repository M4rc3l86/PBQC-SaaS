import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/UserMenu'
import { MobileUserMenu } from '@/components/auth/MobileUserMenu'

export default async function AdminDashboard() {
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

  // Verify user is admin
  if (!profile || profile.role !== 'admin') {
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

          <MobileUserMenu />
          <UserMenu />
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            Willkommen zurück, {profile.full_name || 'Admin'}!
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {profile.company?.name || 'Ihr Unternehmen'} Dashboard
          </p>
        </div>

        {/* Stats placeholder */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Gesamtaufträge
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Aktive Aufträge
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
                  0
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Teammitglieder
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
                  0
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions placeholder */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Schnellaktionen
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">
                Neuen Auftrag erstellen
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Erstellen Sie einen neuen Qualitätskontrollauftrag
              </p>
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                disabled
              >
                Demnächst verfügbar
              </button>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">
                Checklisten verwalten
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Erstellen und verwalten Sie Qualitätskontroll-Checklisten
              </p>
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                disabled
              >
                Demnächst verfügbar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
