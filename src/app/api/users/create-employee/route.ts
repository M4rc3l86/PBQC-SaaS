import { NextRequest, NextResponse } from 'next/server'
import { createEmployeeSchema } from '@/lib/validations/users'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/audit-log'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = createEmployeeSchema.safeParse(body)

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

    const { fullName, email } = validationResult.data

    // Verify requester is authenticated admin
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'unauthorized',
          message: 'Nicht autorisiert',
        },
        { status: 401 }
      )
    }

    // Get profile to verify admin role and get company_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'forbidden',
          message: 'Nicht berechtigt',
        },
        { status: 403 }
      )
    }

    if (!profile?.company_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'no_company',
          message: 'Kein Unternehmen zugewiesen',
        },
        { status: 400 }
      )
    }

    const companyId = profile.company_id

    // Check if email already exists in the same company
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'email_exists',
          message: 'Diese E-Mail-Adresse wird bereits in Ihrem Unternehmen verwendet',
        },
        { status: 400 }
      )
    }

    // Generate a secure temporary password
    const tempPassword = generateSecurePassword()

    // Use admin client to create auth user
    const supabaseAdmin = createAdminClient()
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (createError || !authData.user) {
      console.error('Error creating auth user:', createError)
      return NextResponse.json(
        {
          success: false,
          error: 'create_failed',
          message: 'Fehler beim Erstellen des Benutzers',
        },
        { status: 500 }
      )
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'employee',
        company_id: companyId,
        status: 'active',
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        {
          success: false,
          error: 'profile_failed',
          message: 'Fehler beim Erstellen des Profils',
        },
        { status: 500 }
      )
    }

    // Send password reset email to new employee
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password: tempPassword,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employee/onboarding`,
      },
    })

    if (emailError) {
      console.error('Error sending password reset email:', emailError)
      // Don't fail the request if email fails - user is created
    }

    // Create audit log
    await createAuditLog(
      companyId,
      user.id,
      'user_created',
      authData.user.id,
      {
        new_values: { email, full_name: fullName, role: 'employee' }
      }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Mitarbeiter erfolgreich erstellt',
      },
      { status: 201 }
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

/**
 * Generate a secure temporary password
 * Format: 16 characters with uppercase, lowercase, numbers, and special chars
 */
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + special
  let password = ''

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
