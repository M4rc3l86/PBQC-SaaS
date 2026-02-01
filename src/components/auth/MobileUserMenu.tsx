'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Menu, X } from 'lucide-react'

interface UserProfile {
  full_name: string | null
  email: string | null
  role: string | null
}

export function MobileUserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', authUser.id)
          .single()

        setUser(profile)
      } catch {
        toast.error('Benutzerprofil konnte nicht geladen werden')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsOpen(false)
      router.push('/login')
    } catch {
      toast.error('Abmeldung fehlgeschlagen')
    }
  }

  const settingsPath = user?.role === 'admin' ? '/admin/settings' : '/employee/settings'
  const profilePath = user?.role === 'admin' ? '/admin/profile' : '/employee/profile'

  if (isLoading) {
    return (
      <div className="md:hidden h-8 w-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    )
  }

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="absolute right-4 top-16 z-50 w-64 rounded-lg border bg-white shadow-lg dark:bg-zinc-900 dark:border-zinc-800">
          <div className="border-b p-4 dark:border-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {user?.full_name || 'User'}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {user?.email}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {user?.role === 'admin' ? 'Administrator' : 'Mitarbeiter'}
              </span>
            </div>
          </div>

          <div className="p-2">
            {user?.role === 'admin' && (
              <Link href="/admin/team" onClick={() => setIsOpen(false)}>
                <button className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Team verwalten
                </button>
              </Link>
            )}

            <Link href={profilePath} onClick={() => setIsOpen(false)}>
              <button className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Mein Profil
              </button>
            </Link>

            <Link href={settingsPath} onClick={() => setIsOpen(false)}>
              <button className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Passwort ändern
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
