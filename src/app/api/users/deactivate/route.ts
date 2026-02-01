import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/audit-log'

// Validation schema for deactivation
const deactivateSchema = z.object({
  userId: z.string().uuid('Ungültige Benutzer-ID'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = deactivateSchema.safeParse(body)

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

    const { userId } = validationResult.data

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
      .select('role, company_id, full_name')
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
      .select('id, email, full_name, role, company_id, status')
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

    // Check if already deactivated
    if (targetProfile.status === 'deactivated') {
      return NextResponse.json(
        {
          success: false,
          error: 'already_deactivated',
          message: 'Der Benutzer ist bereits deaktiviert',
        },
        { status: 400 }
      )
    }

    // LAST ADMIN PROTECTION: Count active admins in the company
    if (targetProfile.role === 'admin') {
      const { data: activeAdmins, error: countError } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', companyId)
        .eq('role', 'admin')
        .eq('status', 'active')

      if (countError) {
        console.error('Error counting active admins:', countError)
      } else if (activeAdmins && activeAdmins.length <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'last_admin',
            message: 'Der letzte Administrator kann nicht deaktiviert werden',
          },
          { status: 400 }
        )
      }
    }

    // Use admin client to update status and revoke sessions (ban user)
    const supabaseAdmin = createAdminClient()

    // Ban the user to revoke all sessions
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: '87600h' } // Ban for 10 years
    )

    if (banError) {
      console.error('Error banning user:', banError)
      // Continue with status update even if ban fails
    }

    // Update profile status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'deactivated' })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile status:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'update_failed',
          message: 'Fehler beim Deaktivieren des Benutzers',
        },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog(
      companyId,
      user.id,
      'user_deactivated',
      userId,
      {
        old_values: { status: targetProfile.status },
        new_values: { status: 'deactivated' }
      }
    )

    // Note: Email notifications should be configured via Supabase Dashboard SMTP settings
    // with custom email templates triggered by database functions or webhooks

    return NextResponse.json(
      {
        success: true,
        message: 'Benutzer erfolgreich deaktiviert',
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
