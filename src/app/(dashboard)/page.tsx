import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganization } from "@/lib/organization/actions";
import { getDashboardStats } from "@/lib/stats/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, FileText, Briefcase, CheckCircle, Users } from "lucide-react";

// Job status labels
const jobStatusLabels: Record<string, string> = {
  scheduled: "Geplant",
  in_progress: "In Bearbeitung",
  submitted: "Eingereicht",
  approved: "Genehmigt",
  rejected: "Abgelehnt",
  cancelled: "Abgesagt",
};

// Job status badge colors
const jobStatusBadgeColors: Record<string, "default" | "secondary" | "outline"> = {
  scheduled: "outline",
  in_progress: "default",
  submitted: "secondary",
  approved: "default",
  rejected: "outline",
  cancelled: "outline",
};

export default async function DashboardPage() {
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
  const statsResult = await getDashboardStats(orgId);

  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : {
        activeJobs: 0,
        pendingReviews: 0,
        siteCount: 0,
        memberCount: 0,
        recentJobs: [],
      };

  // Quick actions for the dashboard
  const quickActions = [
    {
      title: "Neuer Auftrag",
      description: "Erstellen Sie einen neuen Auftrag für ein Standort",
      icon: Briefcase,
      href: "/dashboard/jobs/new",
      variant: "default" as const,
    },
    {
      title: "Standorte verwalten",
      description: "Fügen Sie Standorte hinzu oder bearbeiten Sie sie",
      icon: Building,
      href: "/dashboard/sites",
      variant: "outline" as const,
    },
    {
      title: "Vorlagen erstellen",
      description: "Erstellen Sie Checklisten-Vorlagen",
      icon: FileText,
      href: "/dashboard/templates",
      variant: "outline" as const,
    },
    {
      title: "Zur Prüfung",
      description: `${stats.pendingReviews} Auftrag${
        stats.pendingReviews !== 1 ? "e" : ""
      } warten auf Ihre Prüfung`,
      icon: CheckCircle,
      href: "/dashboard/review",
      variant: stats.pendingReviews > 0 ? ("default" as const) : ("secondary" as const),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Willkommen, {user.user_metadata?.name || user.email?.split("@")[0]}
        </h1>
        <p className="text-muted-foreground mt-2">
          Hier ist eine Übersicht über Ihre Aktivitäten bei {orgResult.data.organizations.name}.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Aufträge</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Derzeit aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zur Prüfung</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Warten auf Prüfung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standorte</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.siteCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registrierte Standorte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teammitglieder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memberCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktive Mitglieder
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      {stats.recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aktuelle Aufträge</CardTitle>
            <CardDescription>
              Die letzten 5 Aufträge in Ihrer Organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{job.site_name}</p>
                      <Badge variant={jobStatusBadgeColors[job.status] || "outline"}>
                        {jobStatusLabels[job.status] || job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.template_name} • {job.worker_email}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {job.scheduled_date
                      ? new Date(job.scheduled_date).toLocaleDateString("de-DE")
                      : "-"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Schnellaktionen</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.href} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button variant={action.variant} size="sm">
                      {action.title === "Neuer Auftrag" ? "Erstellen" : "Öffnen"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Erste Schritte</CardTitle>
          <CardDescription>
            Folgen Sie diesen Schritten, um PBQC einzurichten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className={`flex gap-3 ${stats.siteCount > 0 ? "text-muted-foreground" : ""}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                stats.siteCount > 0 ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              } text-xs font-medium`}>
                1
              </span>
              <div>
                <p className="font-medium">Standorte erstellen</p>
                <p className="text-muted-foreground">
                  Fügen Sie die Standorte hinzu, an denen Sie arbeiten
                </p>
              </div>
            </li>
            <li className={`flex gap-3 ${stats.siteCount > 0 && stats.activeJobs > 0 ? "text-muted-foreground" : ""}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                stats.siteCount > 0 && stats.activeJobs > 0 ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              } text-xs font-medium`}>
                2
              </span>
              <div>
                <p className="font-medium">Vorlagen erstellen</p>
                <p className="text-muted-foreground">
                  Erstellen Sie Checklisten-Vorlagen für verschiedene Auftragsarten
                </p>
              </div>
            </li>
            <li className={`flex gap-3 ${stats.activeJobs > 0 ? "text-muted-foreground" : ""}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                stats.activeJobs > 0 ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              } text-xs font-medium`}>
                3
              </span>
              <div>
                <p className="font-medium">Aufträge erstellen</p>
                <p className="text-muted-foreground">
                  Erstellen Sie Aufträge und weisen Sie sie Mitarbeitern zu
                </p>
              </div>
            </li>
            <li className={`flex gap-3 ${stats.pendingReviews > 0 ? "text-muted-foreground" : ""}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                stats.pendingReviews > 0 ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              } text-xs font-medium`}>
                4
              </span>
              <div>
                <p className="font-medium">Aufträge prüfen</p>
                <p className="text-muted-foreground">
                  Prüfen Sie eingereichte Aufträge und genehmigen Sie sie
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
