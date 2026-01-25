import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
import { getTemplateWithItems } from "@/lib/template/actions";
import { TemplateForm } from "@/components/forms/template-form";
import { TemplateItemEditor } from "@/components/template/template-item-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgResult = await getUserOrganization();
  if (!orgResult.success || !orgResult.data) {
    redirect("/dashboard/onboarding");
  }

  const orgId = orgResult.data.organizations.id;
  const templateResult = await getTemplateWithItems(params.id);

  if (!templateResult.success || !templateResult.data) {
    notFound();
  }

  const template = templateResult.data;
  const items = (template.checklist_items as any) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vorlage bearbeiten</h1>
          <p className="text-muted-foreground mt-2">
            Bearbeiten Sie die Vorlage &quot;{template.name}&quot;
          </p>
        </div>
      </div>

      {/* Template Form */}
      <div className="border rounded-lg p-6 max-w-2xl">
        <TemplateForm
          initialData={{
            name: template.name,
            description: template.description ?? undefined,
          }}
          templateId={template.id}
          orgId={orgId}
          onSuccess={() => redirect("/dashboard/templates")}
          onCancel={() => redirect("/dashboard/templates")}
        />
      </div>

      {/* Checklist Items Editor */}
      <TemplateItemEditor templateId={template.id} initialItems={items} />
    </div>
  );
}
