import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/audit-log'

// Validation schema for email update
const updateEmailSchema = z.object({
  userId: z.string().uuid('Ungültige Benutzer-ID'),
  newEmail: z.string().email('Ungültige E-Mail-Adresse'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateEmailSchema.safeParse(body)

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

    const { userId, newEmail } = validationResult.data

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

    // Get admin profile to verify role and get company_id
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'forbidden',
          message: 'Nicht berechtigt',
        },
        { status: 403 }
      )
    }

    if (!adminProfile?.company_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'no_company',
          message: 'Kein Unternehmen zugewiesen',
        },
        { status: 400 }
      )
    }

    const companyId = adminProfile.company_id

    // Check if target user exists and is in the same company
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('id, email, full_name, company_id')
      .eq('id', userId)
      .single()

    if (targetError || !targetProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'user_not_found',
          message: 'Benutzer nicht gefunden',
        },
        { status: 404 }
      )
    }

    if (targetProfile.company_id !== companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'forbidden',
          message: 'Nicht berechtigt',
        },
        { status: 403 }
      )
    }

    // Check if new email is same as current
    if (targetProfile.email === newEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'same_email',
          message: 'Die neue E-Mail-Adresse ist identisch mit der aktuellen',
        },
        { status: 400 }
      )
    }

    // Verify new email isn't already taken in the same company
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', newEmail)
      .eq('company_id', companyId)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'email_exists',
          message: 'Diese E-Mail-Adresse wird bereits verwendet',
        },
        { status: 400 }
      )
    }

    // Use admin client to update auth email
    const supabaseAdmin = createAdminClient()
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: newEmail }
    )

    if (updateError) {
      console.error('Error updating auth email:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'update_failed',
          message: 'Fehler beim Aktualisieren der E-Mail-Adresse',
        },
        { status: 500 }
      )
    }

    // Update profile email
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', userId)

    if (profileUpdateError) {
      console.error('Error updating profile email:', profileUpdateError)
      return NextResponse.json(
        {
          success: false,
          error: 'profile_update_failed',
          message: 'Fehler beim Aktualisieren des Profils',
        },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog(
      companyId,
      user.id,
      'email_changed',
      userId,
      {
        old_values: { email: targetProfile.email },
        new_values: { email: newEmail }
      }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'E-Mail-Adresse erfolgreich aktualisiert',
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
