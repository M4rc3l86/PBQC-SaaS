import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
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
import { Plus, Pencil, FileText, CheckCircle } from "lucide-react";

export default async function TemplatesPage() {
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

  // Get templates with item counts
  const { data: templates } = await supabase
    .from("checklist_templates")
    .select(`
      id,
      name,
      description,
      is_active,
      updated_at,
      checklist_items (count)
    `)
    .eq("org_id", orgId)
    .order("name");

  const templatesWithCounts = templates?.map((t) => ({
    ...t,
    item_count: (t.checklist_items as unknown[])?.length || 0,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vorlagen</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Ihre Checklisten-Vorlagen für Aufträge
          </p>
        </div>
        <Link href="/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neue Vorlage
          </Button>
        </Link>
      </div>

      {/* Templates Table */}
      {templatesWithCounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Vorlagen vorhanden</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Erstellen Sie Ihre erste Vorlage, um Checklisten für Aufträge zu definieren
          </p>
          <Link href="/templates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Erste Vorlage
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Elemente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zuletzt bearbeitet</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templatesWithCounts.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {template.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-muted-foreground" />
                      {template.item_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(template.updated_at).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/templates/${template.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
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
