import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update session and refresh auth state, get user data in one call
  const { response, user } = await updateSession(request)

  // Create a new client for database queries (reuse user from updateSession)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value)
          })
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/employee')
  const isAuthRoute = pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If we have a user, fetch their profile for additional checks
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    // Check if user is deactivated
    if (profile?.status === 'inactive') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'deactivated')
      return NextResponse.redirect(url)
    }

    // Role-based protection for protected routes
    if (isProtectedRoute && profile) {
      // Admin can't access employee routes
      if (pathname.startsWith('/employee') && profile.role === 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
      // Employee can't access admin routes
      if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/employee'
        return NextResponse.redirect(url)
      }
    }

    // Redirect authenticated users from auth routes to appropriate dashboard
    if (isAuthRoute && profile) {
      const url = request.nextUrl.clone()
      if (profile.role === 'admin') {
        url.pathname = '/admin'
      } else if (profile.role === 'employee') {
        url.pathname = '/employee'
      } else {
        url.pathname = '/login'
      }
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
