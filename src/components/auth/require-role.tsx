import { redirect } from "next/navigation";
import { checkRole, type RequiredRole } from "@/lib/auth/guards";

interface RequireRoleProps {
  roles: RequiredRole;
  children: React.ReactNode;
  fallbackUrl?: string;
}

/**
 * Server component that checks if the user has the required role(s)
 * Redirects to unauthorized page if not authorized
 */
export async function RequireRole({
  roles,
  children,
  fallbackUrl = "/unauthorized",
}: RequireRoleProps) {
  const { authorized } = await checkRole(roles);

  if (!authorized) {
    redirect(fallbackUrl);
  }

  return <>{children}</>;
}

/**
 * Server component that requires admin role (owner or manager)
 */
export async function RequireAdmin({
  children,
  fallbackUrl = "/unauthorized",
}: {
  children: React.ReactNode;
  fallbackUrl?: string;
}) {
  return (
    <RequireRole roles={["owner", "manager"]} fallbackUrl={fallbackUrl}>
      {children}
    </RequireRole>
  );
}

/**
 * Server component that requires owner role
 */
export async function RequireOwner({
  children,
  fallbackUrl = "/unauthorized",
}: {
  children: React.ReactNode;
  fallbackUrl?: string;
}) {
  return (
    <RequireRole roles="owner" fallbackUrl={fallbackUrl}>
      {children}
    </RequireRole>
  );
}
