import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
import { getSite } from "@/lib/site/actions";
import { SiteForm } from "@/components/forms/site-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditSitePage({
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
  const siteResult = await getSite(params.id);

  if (!siteResult.success || !siteResult.data) {
    notFound();
  }

  const site = siteResult.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sites">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Standort bearbeiten</h1>
          <p className="text-muted-foreground mt-2">
            Bearbeiten Sie die Details des Standorts &quot;{site.name}&quot;
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="border rounded-lg p-6 max-w-2xl">
        <SiteForm
          initialData={{
            name: site.name,
            address: site.address ?? undefined,
            timezone: site.timezone,
          }}
          siteId={site.id}
          orgId={orgId}
          onSuccess={() => redirect("/dashboard/sites")}
          onCancel={() => redirect("/dashboard/sites")}
        />
      </div>
    </div>
  );
}
