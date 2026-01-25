import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const body = await request.json();
  const { templateId, title, description, requires_photo } = body;

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

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({
      template_id: templateId,
      title,
      description,
      requires_photo,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
