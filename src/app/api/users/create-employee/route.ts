import { NextRequest, NextResponse } from 'next/server'
import { createEmployeeSchema } from '@/lib/validations/users'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/audit-log'
import crypto from 'crypto'

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

    // Generate a secure random password
    const tempPassword = crypto.randomBytes(16).toString('base64').slice(0, 24)

    // Create user with admin API
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    })

    if (userError || !userData.user) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        {
          success: false,
          error: 'user_creation_failed',
          message: 'Fehler beim Erstellen des Benutzers',
          details: process.env.NODE_ENV === 'development' ? userError?.message : undefined
        },
        { status: 500 }
      )
    }

    // Generate password reset link for the new user to set their password
    // Use 'recovery' type since the user already exists in Auth
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`
      }
    })

    if (linkError) {
      console.warn('Password reset link generation failed:', linkError)
      // Don't fail - user was created successfully
    } else if (linkData?.properties?.action_link) {
      // Log the invitation link for the admin to send
      console.log('\n' + '='.repeat(60))
      console.log(`EMPLOYEE INVITATION LINK for ${email}`)
      console.log('='.repeat(60))
      console.log(`Send this link to ${fullName} (${email}):`)
      console.log(linkData.properties.action_link)
      console.log('='.repeat(60) + '\n')
    }

    // Create or update profile record using admin client to bypass RLS
    // Supabase may auto-create a profile, so we use upsert
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email,
        full_name: fullName,
        role: 'employee',
        company_id: companyId,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      return NextResponse.json(
        {
          success: false,
          error: 'profile_failed',
          message: 'Fehler beim Erstellen des Profils',
        },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog(
      companyId,
      user.id,
      'user_created',
      userData.user.id,
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
  } catch (error) {
    console.error('Unexpected error in create-employee:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'server_error',
        message: 'Ein unerwarteter Fehler ist aufgetreten',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
