'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const RATE_LIMIT_KEY = 'loginAttempts'
const RATE_LIMIT_DURATION = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

function getLoginAttempts(): { count: number; lastAttempt: number } {
  if (typeof window === 'undefined') return { count: 0, lastAttempt: 0 }
  const data = localStorage.getItem(RATE_LIMIT_KEY)
  if (!data) return { count: 0, lastAttempt: 0 }
  return JSON.parse(data)
}

function setLoginAttempts(count: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count, lastAttempt: Date.now() }))
}

function isRateLimited(): boolean {
  const { count, lastAttempt } = getLoginAttempts()
  if (count >= MAX_ATTEMPTS) {
    const timePassed = Date.now() - lastAttempt
    if (timePassed < RATE_LIMIT_DURATION) {
      return true
    }
    // Reset after duration expires
    setLoginAttempts(0)
  }
  return false
}

function incrementLoginAttempts() {
  const { count } = getLoginAttempts()
  setLoginAttempts(count + 1)
}

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    // Check rate limit
    if (isRateLimited()) {
      toast.error('Too many login attempts. Please try again later.')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        incrementLoginAttempts()
        toast.error(error.message || 'Failed to sign in')
        return
      }

      // Get user profile to check role and status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        toast.error('Failed to load user profile')
        await supabase.auth.signOut()
        return
      }

      if (profile.status === 'deactivated') {
        toast.error('Your account has been deactivated. Please contact support.')
        await supabase.auth.signOut()
        return
      }

      // Reset login attempts on success
      setLoginAttempts(0)

      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin')
      } else if (profile.role === 'employee') {
        router.push('/employee')
      } else {
        toast.error('Invalid user role')
        await supabase.auth.signOut()
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={isLoading}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
