import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/UserMenu'
import { MobileUserMenu } from '@/components/auth/MobileUserMenu'
import { TeamList } from '@/components/admin/team-list'

export default async function AdminTeamPage() {
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
    .select('*, company:companies(*)')
    .eq('id', user.id)
    .single()

  // Verify user is admin
  if (!profile || profile.role !== 'admin') {
    redirect('/login')
  }

  // Check if user needs onboarding (no phone set and no last_login)
  if (!profile.phone && !profile.last_login) {
    redirect('/admin/onboarding')
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
        <TeamList />
      </main>
    </div>
  )
}
