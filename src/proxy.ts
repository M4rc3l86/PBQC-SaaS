import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database, OrgRole } from "@/types/database";

// Routes that require admin role (owner or manager)
const adminRoutes = [
  "/team",
  "/settings",
  "/billing",
];

// Routes that are specifically for workers
// Note: Currently permissive - admins can also access worker routes for testing/support
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const workerRoutes = ["/worker"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for Next.js internal routes and static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".") // Files with extensions like .js, .css, .ico, etc.
  ) {
    return NextResponse.next();
  }
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  // Note: "/" is NOT public - we handle it specially below to redirect based on auth state
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/auth/callback",
    "/verify-success",
    "/unauthorized",
    "/r/",
    "/invite/",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith("/r/") ||
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/invite/"),
  );

  // Redirect unauthenticated users to login (except for public routes)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login/register to dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Special handling for root path "/" - check auth and membership
  if (pathname === "/") {
    // Unauthenticated users go to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Authenticated users - check org membership
    const { data: membership } = await supabase
      .from("org_members")
      .select("role, org_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // No active membership? Go to onboarding
    if (!membership) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Has active membership - serve the dashboard page
    // (The dashboard is at src/app/(dashboard)/page.tsx)
    // Fall through to continue...
  }

  // For authenticated users on non-public routes, check org membership and role
  if (user && !isPublicRoute) {
    const { data: membership } = await supabase
      .from("org_members")
      .select("role, org_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Onboarding detection: redirect users without org to onboarding
    // (unless they're already on onboarding page)
    if (!membership && pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // If user has membership, check role-based access
    if (membership) {
      const role = membership.role as OrgRole;
      const isAdmin = role === "owner" || role === "manager";

      // Check admin routes
      const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route),
      );
      if (isAdminRoute && !isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Check worker-only routes (workers can access, but so can admins viewing worker UI)
      // This is permissive - admins can view worker UI for testing/support
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}
