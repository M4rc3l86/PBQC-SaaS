import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // Determine redirect path based on auth type
      // 'signup' = email confirmation, 'magiclink' = login via magic link
      // 'recovery' = password reset (handled by next param)
      let redirectPath = next;
      if (type === "signup") {
        redirectPath = "/verify-success";
      }

      const baseUrl =
        isLocalEnv ? origin
        : forwardedHost ? `https://${forwardedHost}`
        : origin;

      return NextResponse.redirect(`${baseUrl}${redirectPath}`);
    }
  }

  // Return to login if there was an error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
