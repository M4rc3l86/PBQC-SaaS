import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/UserMenu'
import { MobileUserMenu } from '@/components/auth/MobileUserMenu'
import { ProfileForm } from '@/components/profile/profile-form'
import { Separator } from '@/components/ui/separator'

export default async function AdminProfilePage() {
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

  // Check if user needs onboarding
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
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">Mein Profil</h1>
          <p className="mt-2 text-muted-foreground">
            Verwalten Sie Ihre persönlichen Informationen
          </p>

          <Separator className="my-6" />

          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="text-xl font-semibold">Profilinformationen</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Aktualisieren Sie Ihre persönlichen Daten hier
            </p>

            <ProfileForm />
          </div>

          {/* Additional profile sections */}
          <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="text-xl font-semibold">Kontoinformationen</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rolle</span>
                <span className="font-medium">Administrator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firma</span>
                <span className="font-medium">{profile.company?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mitglied seit</span>
                <span className="font-medium">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('de-DE')
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
