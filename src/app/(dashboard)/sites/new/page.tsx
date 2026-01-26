import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
import { SiteForm } from "@/components/forms/site-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewSitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgResult = await getUserOrganization();
  if (!orgResult.success || !orgResult.data) {
    redirect("/onboarding");
  }

  const orgId = orgResult.data.organizations.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sites">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neuer Standort</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie einen neuen Standort für Aufträge
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="border rounded-lg p-6 max-w-2xl">
        <SiteForm orgId={orgId} cancelUrl="/sites" />
      </div>
    </div>
  );
}
