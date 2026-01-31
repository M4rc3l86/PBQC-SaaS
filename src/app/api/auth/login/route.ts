import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'
import {
  getClientIp,
  checkRateLimit,
  recordRateLimitAttempt,
  resetRateLimit,
} from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
      return NextResponse.json(
        {
          success: false,
          error: 'rate_limited',
          message: 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.',
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

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'auth_error',
          message: error.message || 'Ungültige Anmeldedaten',
          remainingAttempts: rateLimitResult.remainingAttempts - 1,
        },
        { status: 401 }
      )
    }

    // Get user profile to check role and status
    // Use admin client to bypass RLS since the session isn't fully established yet
    const adminClient = createAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'profile_error',
          message: 'Benutzerprofil konnte nicht geladen werden',
        },
        { status: 500 }
      )
    }

    if (profile.status === 'deactivated') {
      return NextResponse.json(
        {
          success: false,
          error: 'account_deactivated',
          message: 'Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie den Support.',
        },
        { status: 403 }
      )
    }

    // Successful login - reset rate limit
    await resetRateLimit(identifier, 'login')

    // Update last_login in profile (using admin client to bypass RLS)
    await adminClient
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id)

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          profile: {
            role: profile.role,
            status: profile.status,
          },
        },
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
