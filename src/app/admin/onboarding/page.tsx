import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/profile/onboarding-form'

export default async function AdminOnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Verify user is admin
  if (!profile || profile.role !== 'admin') {
    redirect('/login')
  }

  // Skip onboarding if already completed (has phone or has logged in before)
  if (profile.phone || profile.last_login) {
    redirect('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">PB</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Willkommen bei PBQC
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Richten Sie Ihr Profil fertig ein, um loszulegen
          </p>
        </div>

        {/* Onboarding form */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
          <OnboardingForm role="admin" />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Durch das Einrichten Ihres Profils stimmen Sie unseren Nutzungsbedingungen zu.
        </p>
      </div>
    </div>
  )
}
