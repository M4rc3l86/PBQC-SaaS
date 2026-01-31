import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          redirect('/admin')
        } else if (profile?.role === 'employee') {
          redirect('/employee')
        }
      }

      // If no profile found, go to login
      redirect('/login')
    }
  }

  // If there's an error or no code, redirect to login with error
  redirect(`/login?error=${encodeURIComponent('Authentication failed')}`)
}
