import { NextRequest, NextResponse } from 'next/server'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import {
  getClientIp,
  checkRateLimit,
  recordRateLimitAttempt,
} from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = forgotPasswordSchema.safeParse(body)

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

    const { email } = validationResult.data

    // Get client IP for rate limiting
    const identifier = await getClientIp()

    // Check rate limit
    const rateLimitResult = await checkRateLimit(identifier, 'forgot_password')

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'rate_limited',
          message: 'Zu viele Anfragen zum Zurücksetzen des Passworts. Bitte versuchen Sie es später erneut.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      )
    }

    // Record the attempt
    await recordRateLimitAttempt(identifier, 'forgot_password')

    // Attempt to send password reset email
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    })

    // Always return success message (security best practice - don't reveal if email exists)
    // even if Supabase returns an error
    if (error) {
      // Log the error but don't expose it
      console.error('Password reset error:', error)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Wenn ein Konto mit dieser E-Mail existiert, wurde ein Rücksetzlink gesendet.',
        remainingAttempts: rateLimitResult.remainingAttempts - 1,
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
