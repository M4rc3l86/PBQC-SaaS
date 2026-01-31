import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'
import {
  getClientIp,
  checkRateLimit,
  recordRateLimitAttempt,
  resetRateLimit,
} from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Get client IP for rate limiting
    const identifier = await getClientIp()

    // Check rate limit
    const rateLimitResult = await checkRateLimit(identifier, 'login')

    if (!rateLimitResult.allowed) {
      const minutes = Math.ceil((rateLimitResult.retryAfter || 0) / 60)
      return NextResponse.json(
        {
          success: false,
          error: 'rate_limited',
          message: `Zu viele Anmeldeversuche. Bitte versuchen Sie es in ${minutes} Minute${minutes > 1 ? 'n' : ''} erneut.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      )
    }

    // Record the attempt
    await recordRateLimitAttempt(identifier, 'login')

    // Attempt authentication
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      // Generic error message for security (don't reveal if email exists)
      return NextResponse.json(
        {
          success: false,
          error: 'invalid_credentials',
          message: 'Ungültige Anmeldedaten',
        },
        { status: 401 }
      )
    }

    // Get profile to check role and status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      // Sign out user since profile couldn't be loaded
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          success: false,
          error: 'invalid_credentials',
          message: 'Ungültige Anmeldedaten',
        },
        { status: 401 }
      )
    }

    // Check if account is deactivated
    if (profile.status === 'deactivated') {
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          success: false,
          error: 'account_deactivated',
          message: 'Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie den Support.',
        },
        { status: 403 }
      )
    }

    // Update last_login
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id)

    // Reset rate limit on successful login
    await resetRateLimit(identifier, 'login')

    // Determine redirect based on role
    const redirectTo = profile.role === 'admin' ? '/admin' : '/employee'

    return NextResponse.json(
      {
        success: true,
        redirectTo,
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'server_error',
        message: 'Ein unerwarteter Fehler ist aufgetreten',
      },
      { status: 500 }
    )
  }
}
