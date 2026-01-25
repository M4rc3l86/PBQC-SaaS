import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
import { TemplateForm } from "@/components/forms/template-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewTemplatePage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Neue Vorlage</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Checklisten-Vorlage
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="border rounded-lg p-6 max-w-2xl">
        <TemplateForm
          orgId={orgId}
          onSuccess={(templateId) => redirect(`/dashboard/templates/${templateId}/edit`)}
          onCancel={() => redirect("/dashboard/templates")}
        />
      </div>
    </div>
  );
}
