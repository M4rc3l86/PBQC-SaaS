"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CreateSiteInput } from "@/lib/validations/site";

/**
 * Create a new site
 */
export async function createSite(orgId: string, data: CreateSiteInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  // Provide default timezone if not specified
  const siteData = {
    org_id: orgId,
    name: data.name,
    address: data.address,
    timezone: data.timezone || "Europe/Berlin",
  };

  const { data: site, error } = await supabase
    .from("sites")
    .insert(siteData)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, data: site };
}

/**
 * Get all sites for an organization
 */
export async function getSites(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("org_id", orgId)
    .order("name");

  if (error) return { error: error.message };

  return { success: true, data };
}

/**
 * Update a site
 */
export async function updateSite(siteId: string, data: CreateSiteInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data: site, error } = await supabase
    .from("sites")
    .update(data)
    .eq("id", siteId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, data: site };
}

/**
 * Get a single site by ID
 */
export async function getSite(siteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .single();

  if (error) return { error: error.message };

  return { success: true, data };
}

/**
 * Delete a site
 */
export async function deleteSite(siteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}
