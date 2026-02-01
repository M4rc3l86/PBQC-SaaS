'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface LogoProps {
  href?: string // Optional custom href (for auth pages, etc.)
  className?: string
}

export function Logo({ href, className = '' }: LogoProps) {
  const [roleBasedHref, setRoleBasedHref] = useState<string>('/')

  useEffect(() => {
    // If custom href is provided, we don't need to fetch role
    if (href) return

    // Determine dashboard based on user role
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Get user profile to determine role
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setRoleBasedHref(data?.role === 'admin' ? '/admin' : '/employee')
          })
      } else {
        setRoleBasedHref('/')
      }
    })
  }, [href])

  // Use provided href, or fall back to role-based href
  const linkHref = href ?? roleBasedHref

  return (
    <Link href={linkHref} className={`flex items-center gap-2 font-bold text-xl ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        PB
      </div>
      PBQC
    </Link>
  )
}
