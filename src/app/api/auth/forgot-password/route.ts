import { NextRequest, NextResponse } from 'next/server'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import {
  getClientIp,
  checkRateLimit,
  recordRateLimitAttempt,
} from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/audit-log'

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

    // Use admin client for all operations (same pattern as employee invitations)
    const supabaseAdmin = createAdminClient()

    // Try to get user for audit logging (may be null if user doesn't exist)
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    let userId: string | null = null
    let companyId: string | null = null

    if (user) {
      userId = user.id
      // Try to get user's profile for company_id
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('company_id')
        .eq('id', userId)
        .maybeSingle()

      companyId = profile?.company_id ?? null
    }

    // Generate password reset link using admin API (same pattern as employee invitations)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`
      }
    })

    if (linkError) {
      console.warn('Password reset link generation failed:', linkError)
    } else if (linkData?.properties?.action_link) {
      // Log the link for admin to manually send (same format as employee invitations)
      console.log('\n' + '='.repeat(60))
      console.log(`PASSWORD RESET LINK for ${email}`)
      console.log('='.repeat(60))
      console.log(linkData.properties.action_link)
      console.log('='.repeat(60) + '\n')
    }

    // Create audit log if we have user information
    if (userId && companyId) {
      try {
        await createAuditLog(
          companyId,
          userId,
          'password_reset',
          userId,
          { new_values: { email } }
        )
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError)
        // Don't fail the main operation
      }
    }

    // Always return success message (security best practice - don't reveal if email exists)
    return NextResponse.json(
      {
        success: true,
        message: 'Wenn ein Konto mit dieser E-Mail existiert, wurde ein Rücksetzlink generiert.',
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
