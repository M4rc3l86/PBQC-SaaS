import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization, getOrgMembers } from "@/lib/organization/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { TeamInviteDialog } from "@/components/team/invite-member-dialog";

// Role labels
const roleLabels: Record<string, string> = {
  owner: "Inhaber",
  manager: "Manager",
  worker: "Mitarbeiter",
};

// Role badge colors
const roleBadgeColors: Record<string, "default" | "secondary"> = {
  owner: "default",
  manager: "secondary",
  worker: "secondary",
};

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgResult = await getUserOrganization();
  if (!orgResult.success || !orgResult.data) {
    redirect("/onboarding");
  }

  const orgId = orgResult.data.organizations.id;
  const userRole = orgResult.data.role;
  const membersResult = await getOrgMembers(orgId);
  const members = membersResult.success ? (membersResult.data ?? []) : [];

  const canManage = userRole === "owner" || userRole === "manager";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie die Mitglieder Ihrer Organisation
          </p>
        </div>
        {canManage && <TeamInviteDialog orgId={orgId} />}
      </div>

      {/* Members Table */}
      {members.length === 0 ?
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg border-dashed">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Mitglieder</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {canManage ?
              "Laden Sie Teammitglieder ein, um gemeinsam zu arbeiten"
            : "Noch keine anderen Mitglieder in dieser Organisation"}
          </p>
          {canManage && <TeamInviteDialog orgId={orgId} />}
        </div>
      : <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Beigetreten</TableHead>
                {canManage && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeColors[member.role] || "outline"}>
                      {roleLabels[member.role] || member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                    >
                      {member.status === "active" ?
                        "Aktiv"
                      : member.status === "invited" ?
                        "Eingeladen"
                      : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {member.joined_at ?
                      new Date(member.joined_at).toLocaleDateString("de-DE")
                    : member.invited_at ?
                      new Date(member.invited_at).toLocaleDateString("de-DE")
                    : "-"}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {/* TODO: Add actions in separate dialog components */}
                      <span className="text-muted-foreground text-sm">
                        Aktionen folgen
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }
    </div>
  );
}
