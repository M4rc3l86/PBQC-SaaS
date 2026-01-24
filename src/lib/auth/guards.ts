import { createClient } from "@/lib/supabase/server";
import type { OrgRole } from "@/types/database";

export type RequiredRole = OrgRole | OrgRole[];

/**
 * Check if user has required role(s)
 * Returns the user's role if authorized, null if not
 */
export async function checkRole(requiredRoles: RequiredRole): Promise<{
  authorized: boolean;
  role: OrgRole | null;
  orgId: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, role: null, orgId: null };
  }

  const { data: membership } = await supabase
    .from("org_members")
    .select("role, org_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!membership) {
    return { authorized: false, role: null, orgId: null };
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const authorized = roles.includes(membership.role);

  return {
    authorized,
    role: membership.role,
    orgId: membership.org_id,
  };
}

/**
 * Check if user is an admin (owner or manager)
 */
export async function isAdmin(): Promise<boolean> {
  const { authorized } = await checkRole(["owner", "manager"]);
  return authorized;
}

/**
 * Check if user is the organization owner
 */
export async function isOwner(): Promise<boolean> {
  const { authorized } = await checkRole("owner");
  return authorized;
}

/**
 * Get the user's current role
 */
export async function getUserRole(): Promise<OrgRole | null> {
  const { role } = await checkRole([]);
  return role;
}
