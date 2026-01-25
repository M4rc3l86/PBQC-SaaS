"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateTemplateInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
  ReorderItemsInput,
} from "@/lib/validations/template";

/**
 * Create a new checklist template
 */
export async function createTemplate(orgId: string, data: CreateTemplateInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data: template, error } = await supabase
    .from("checklist_templates")
    .insert({ org_id: orgId, ...data })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, data: template };
}

/**
 * Get all templates for an organization
 */
export async function getTemplates(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data, error } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("org_id", orgId)
    .order("name");

  if (error) return { error: error.message };

  return { success: true, data };
}

/**
 * Get template with items
 */
export async function getTemplateWithItems(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data, error } = await supabase
    .from("checklist_templates")
    .select(`
      *,
      checklist_items (
        id,
        title,
        description,
        sort_order,
        requires_photo
      )
    `)
    .eq("id", templateId)
    .order("sort_order")
    .single();

  if (error) return { error: error.message };

  return { success: true, data };
}

/**
 * Update a template
 */
export async function updateTemplate(templateId: string, data: CreateTemplateInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data: template, error } = await supabase
    .from("checklist_templates")
    .update(data)
    .eq("id", templateId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, data: template };
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { error } = await supabase
    .from("checklist_templates")
    .delete()
    .eq("id", templateId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

/**
 * Add a checklist item to a template
 */
export async function addChecklistItem(templateId: string, data: CreateChecklistItemInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  // Get the next sort_order
  const { data: existingItems } = await supabase
    .from("checklist_items")
    .select("sort_order")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingItems && existingItems.length > 0
    ? existingItems[0].sort_order + 1
    : 1;

  const { data: item, error } = await supabase
    .from("checklist_items")
    .insert({
      template_id: templateId,
      title: data.title,
      description: data.description || null,
      item_type: data.item_type,
      requires_photo: data.requires_photo,
      requires_note: data.requires_note,
      sort_order: nextSortOrder,
      parent_id: data.parent_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, data: item };
}

/**
 * Update a checklist item
 */
export async function updateChecklistItem(itemId: string, data: UpdateChecklistItemInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { data: item, error } = await supabase
    .from("checklist_items")
    .update({
      title: data.title,
      description: data.description || null,
      item_type: data.item_type,
      requires_photo: data.requires_photo,
      requires_note: data.requires_note,
      sort_order: data.sort_order,
      parent_id: data.parent_id,
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, data: item };
}

/**
 * Delete a checklist item
 */
export async function deleteChecklistItem(itemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

/**
 * Reorder checklist items
 */
export async function reorderChecklistItems(templateId: string, data: ReorderItemsInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  // Update each item's sort_order
  const updates = data.items.map((item) =>
    supabase
      .from("checklist_items")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);

  for (const result of results) {
    if (result.error) {
      return { error: result.error.message };
    }
  }

  revalidatePath("/");
  return { success: true };
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht authentifiziert" };

  // Get the template with items
  const { data: template, error: templateError } = await supabase
    .from("checklist_templates")
    .select(`
      *,
      checklist_items (
        title,
        description,
        item_type,
        requires_photo,
        requires_note,
        sort_order,
        parent_id
      )
    `)
    .eq("id", templateId)
    .single();

  if (templateError) return { error: templateError.message };

  // Create new template with "(Kopie)" suffix
  const { data: newTemplate, error: createError } = await supabase
    .from("checklist_templates")
    .insert({
      org_id: template.org_id,
      name: `${template.name} (Kopie)`,
      description: template.description,
    })
    .select()
    .single();

  if (createError) return { error: createError.message };

  // Copy all items
  if (template.checklist_items && template.checklist_items.length > 0) {
    const itemsToInsert = template.checklist_items.map((item: any) => ({
      template_id: newTemplate.id,
      title: item.title,
      description: item.description,
      item_type: item.item_type,
      requires_photo: item.requires_photo,
      requires_note: item.requires_note,
      sort_order: item.sort_order,
      parent_id: item.parent_id,
    }));

    const { error: itemsError } = await supabase
      .from("checklist_items")
      .insert(itemsToInsert);

    if (itemsError) return { error: itemsError.message };
  }

  revalidatePath("/dashboard/templates");
  return { success: true, data: newTemplate };
}
