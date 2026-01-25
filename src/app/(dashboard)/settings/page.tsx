import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form";
import { DeleteOrgDialog } from "@/components/settings/delete-org-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgResult = await getUserOrganization();

  if (!orgResult.success || !orgResult.data) {
    redirect("/dashboard/onboarding");
  }

  const org = orgResult.data.organizations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihre Organisationseinstellungen
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
          <CardDescription>
            Allgemeine Informationen zu Ihrer Organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationSettingsForm
            organizationId={org.id}
            initialName={org.name}
            ownerEmail={orgResult.data.email || user.email || ""}
            createdAt={org.created_at}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Gefahrenbereich</CardTitle>
          <CardDescription>
            irreversible Aktionen für Ihre Organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteOrgDialog organizationId={org.id} organizationName={org.name} />
        </CardContent>
      </Card>
    </div>
  );
}
