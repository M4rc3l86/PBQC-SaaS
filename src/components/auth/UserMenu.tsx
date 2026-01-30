'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UserProfile {
  full_name: string | null
  email: string | null
  role: string | null
}

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
        toast.error('Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      toast.error('Failed to log out')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {user?.full_name || 'User'}
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {user?.role === 'admin' ? 'Administrator' : 'Employee'}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
      >
        Log out
      </Button>
    </div>
  )
}
