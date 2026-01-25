import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
import { getSites } from "@/lib/site/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, MapPin, Clock } from "lucide-react";

export default async function SitesPage() {
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
  const sitesResult = await getSites(orgId);

  const sites = sitesResult.success ? (sitesResult.data ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Standorte</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Ihre Standorte, an denen Aufträge ausgeführt werden
          </p>
        </div>
        <Link href="/dashboard/sites/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Standort
          </Button>
        </Link>
      </div>

      {/* Sites Table */}
      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg border-dashed">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Standorte vorhanden</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Erstellen Sie Ihren ersten Standort, um mit der Arbeit zu beginnen
          </p>
          <Link href="/dashboard/sites/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Erster Standort
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Zeitzone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {site.address || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {site.timezone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.is_active ? "default" : "secondary"}>
                      {site.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/sites/${site.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
