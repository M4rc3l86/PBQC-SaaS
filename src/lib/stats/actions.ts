"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  activeJobs: number;
  pendingReviews: number;
  siteCount: number;
  memberCount: number;
  recentJobs: Array<{
    id: string;
    site_name: string;
    template_name: string;
    worker_email: string;
    status: string;
    scheduled_date: string;
  }>;
}

/**
 * Get dashboard statistics for an organization
 */
export async function getDashboardStats(orgId: string): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert", success: false };
  }

  try {
    // Get active jobs count (scheduled or in_progress)
    const { count: activeJobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .in("status", ["scheduled", "in_progress"]);

    // Get pending reviews count (submitted)
    const { count: pendingReviews } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "submitted");

    // Get site count
    const { count: siteCount } = await supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("is_active", true);

    // Get active member count
    const { count: memberCount } = await supabase
      .from("org_members")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "active");

    // Get recent jobs (last 5)
    const { data: recentJobsData } = await supabase
      .from("jobs")
      .select(`
        id,
        status,
        scheduled_date,
        sites:site_id (name),
        templates:template_id (name),
        org_members:assigned_worker_id (email)
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Helper function to safely extract name/email from Supabase relations
    const getRelationName = (relation: unknown): string | null => {
      if (!relation) return null;
      // Supabase returns either an object or an array of objects
      if (Array.isArray(relation)) {
        return relation.length > 0 && typeof relation[0] === "object" && relation[0] !== null && "name" in relation[0]
          ? String(relation[0].name)
          : null;
      }
      if (typeof relation === "object" && relation !== null && "name" in relation) {
        return String(relation.name);
      }
      return null;
    };

    const getRelationEmail = (relation: unknown): string | null => {
      if (!relation) return null;
      if (Array.isArray(relation)) {
        return relation.length > 0 && typeof relation[0] === "object" && relation[0] !== null && "email" in relation[0]
          ? String(relation[0].email)
          : null;
      }
      if (typeof relation === "object" && relation !== null && "email" in relation) {
        return String(relation.email);
      }
      return null;
    };

    const recentJobs = (recentJobsData ?? []).map((job) => {
      const siteName = getRelationName((job as { sites?: unknown }).sites);
      const templateName = getRelationName((job as { templates?: unknown }).templates);
      const workerEmail = getRelationEmail((job as { org_members?: unknown }).org_members);

      return {
        id: job.id,
        site_name: siteName ?? "Unbekannt",
        template_name: templateName ?? "Unbekannt",
        worker_email: workerEmail ?? "Nicht zugewiesen",
        status: job.status,
        scheduled_date: job.scheduled_date,
      };
    });

    return {
      success: true,
      data: {
        activeJobs: activeJobs ?? 0,
        pendingReviews: pendingReviews ?? 0,
        siteCount: siteCount ?? 0,
        memberCount: memberCount ?? 0,
        recentJobs,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}
