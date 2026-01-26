"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateMemberRoleInput,
} from "@/lib/validations/organization";

/**
 * Creates organization + owner membership + trial subscription
 */
export async function createOrganization(data: CreateOrganizationInput) {
  // Use regular client to get authenticated user (has cookies)
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  // Use admin client for database operations (bypasses RLS)
  const supabase = await createAdminClient();

  // 1. Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: data.name })
    .select()
    .single();

  if (orgError) {
    return { error: orgError.message };
  }

  // 2. Create owner membership
  const { error: memberError } = await supabase
    .from("org_members")
    .insert({
      org_id: org.id,
      user_id: user.id,
      email: user.email!,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
    });

  if (memberError) {
    return { error: memberError.message };
  }

  // 3. Create trial subscription
  const { error: billingError } = await supabase
    .from("billing_subscriptions")
    .insert({
      org_id: org.id,
      plan: "starter",
      status: "trialing",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

  if (billingError) {
    return { error: billingError.message };
  }

  revalidatePath("/");
  return { success: true, data: org };
}

/**
 * Get organization by ID
 */
export async function getOrganization(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

/**
 * Update organization name
 */
export async function updateOrganization(
  orgId: string,
  data: UpdateOrganizationInput,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  const { data: org, error } = await supabase
    .from("organizations")
    .update({ name: data.name })
    .eq("id", orgId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true, data: org };
}

/**
 * Soft delete organization
 */
export async function deleteOrganization(orgId: string) {
  const supabase = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  // Verify ownership
  const { data: member } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!member || member.role !== "owner") {
    return { error: "Nur der Inhaber kann die Organisation löschen" };
  }

  // Soft delete
  const { error } = await supabase
    .from("organizations")
    .update({ is_active: false })
    .eq("id", orgId);

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

/**
 * Get user's organization
 */
export async function getUserOrganization() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  const { data, error } = await supabase
    .from("org_members")
    .select(`
      org_id,
      role,
      email,
      organizations (
        id,
        name,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

/**
 * Get all members of an organization
 */
export async function getOrgMembers(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  const { data, error } = await supabase
    .from("org_members")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  memberId: string,
  data: UpdateMemberRoleInput
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  // Get the member to update and check org
  const { data: targetMember } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("id", memberId)
    .single();

  if (!targetMember) {
    return { error: "Mitglied nicht gefunden" };
  }

  // Check if user is owner of the org
  const { data: currentUser } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", targetMember.org_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!currentUser || currentUser.role !== "owner") {
    return { error: "Nur der Inhaber kann Rollen ändern" };
  }

  // Prevent changing the last owner
  if (targetMember.role === "owner" && data.role !== "owner") {
    // Count other owners
    const { data: otherOwners } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", targetMember.org_id)
      .eq("role", "owner")
      .neq("id", memberId);

    if (!otherOwners || otherOwners.length === 0) {
      return {
        error: "Die Organisation muss mindestens einen Inhaber haben",
      };
    }
  }

  const { error } = await supabase
    .from("org_members")
    .update({ role: data.role })
    .eq("id", memberId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/team");
  return { success: true };
}

/**
 * Remove a member from the organization
 */
export async function removeMember(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht authentifiziert" };
  }

  // Get the member to remove and check org
  const { data: targetMember } = await supabase
    .from("org_members")
    .select("org_id, role, user_id")
    .eq("id", memberId)
    .single();

  if (!targetMember) {
    return { error: "Mitglied nicht gefunden" };
  }

  // Check if user is owner of the org
  const { data: currentUser } = await supabase
    .from("org_members")
    .select("role, user_id")
    .eq("org_id", targetMember.org_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!currentUser || currentUser.role !== "owner") {
    return { error: "Nur der Inhaber kann Mitglieder entfernen" };
  }

  // Prevent removing yourself
  if (targetMember.user_id === user.id) {
    return { error: "Sie können sich nicht selbst entfernen" };
  }

  // Prevent removing the last owner
  if (targetMember.role === "owner") {
    const { data: otherOwners } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", targetMember.org_id)
      .eq("role", "owner")
      .neq("id", memberId);

    if (!otherOwners || otherOwners.length === 0) {
      return {
        error: "Die Organisation muss mindestens einen Inhaber haben",
      };
    }
  }

  // Soft delete by setting status to inactive
  const { error } = await supabase
    .from("org_members")
    .update({ status: "inactive" })
    .eq("id", memberId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/team");
  return { success: true };
}
