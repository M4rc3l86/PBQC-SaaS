import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/audit-log'

// Validation schema for reactivation
const reactivateSchema = z.object({
  userId: z.string().uuid('Ungültige Benutzer-ID'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = reactivateSchema.safeParse(body)

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
      .select('id, email, full_name, company_id, status')
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

    // Check if already active
    if (targetProfile.status === 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'already_active',
          message: 'Der Benutzer ist bereits aktiv',
        },
        { status: 400 }
      )
    }

    // Use admin client to update status and unban user
    const supabaseAdmin = createAdminClient()

    // Unban the user to allow login again
    const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: '0s' } // Remove ban
    )

    if (unbanError) {
      console.error('Error unbanning user:', unbanError)
      // Continue with status update even if unban fails
    }

    // Update profile status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile status:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'update_failed',
          message: 'Fehler beim Reaktivieren des Benutzers',
        },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog(
      companyId,
      user.id,
      'user_reactivated',
      userId,
      {
        old_values: { status: targetProfile.status },
        new_values: { status: 'active' }
      }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Benutzer erfolgreich reaktiviert',
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
