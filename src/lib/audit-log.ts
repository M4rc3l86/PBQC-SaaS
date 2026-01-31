import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import type { Json } from "@/types/database";

export type AuditAction =
  | "user_created"
  | "user_updated"
  | "user_deactivated"
  | "user_reactivated"
  | "password_reset"
  | "email_changed";

export interface AuditLogDetails {
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  changes?: string[];
  reason?: string;
}

/**
 * Creates an audit log entry for admin actions.
 * Uses admin client to bypass RLS - only call from verified API routes.
 */
export async function createAuditLog(
  companyId: string,
  actorId: string,
  action: AuditAction,
  targetUserId: string | null,
  details: AuditLogDetails = {},
): Promise<void> {
  const supabase = createAdminClient();

  // Extract IP and user agent from request headers
  const headersList = await headers();
  const ipAddress =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    null;

  const userAgent = headersList.get("user-agent") || null;

  // Convert details to Json type
  const detailsJson = details as Json;

  const { error } = await supabase.from("audit_logs").insert({
    company_id: companyId,
    actor_id: actorId,
    target_user_id: targetUserId,
    action,
    details: detailsJson,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  if (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit log failure shouldn't break the main operation
  }
}
