import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, FileText, Briefcase, CheckCircle, Users } from "lucide-react";

export default function DashboardPage() {
  // Quick stats and actions for the dashboard
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
      description: "Aufträge warten auf Ihre Prüfung",
      icon: CheckCircle,
      href: "/dashboard/review",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Willkommen</h1>
        <p className="text-muted-foreground mt-2">
          Hier ist eine Übersicht über Ihre Aktivitäten.
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
            <div className="text-2xl font-bold">0</div>
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
            <div className="text-2xl font-bold">0</div>
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
            <div className="text-2xl font-bold">0</div>
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktive Mitglieder
            </p>
          </CardContent>
        </Card>
      </div>

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
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                1
              </span>
              <div>
                <p className="font-medium">Standorte erstellen</p>
                <p className="text-muted-foreground">
                  Fügen Sie die Standorte hinzu, an denen Sie arbeiten
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                2
              </span>
              <div>
                <p className="font-medium">Vorlagen erstellen</p>
                <p className="text-muted-foreground">
                  Erstellen Sie Checklisten-Vorlagen für verschiedene Auftragsarten
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                3
              </span>
              <div>
                <p className="font-medium">Aufträge erstellen</p>
                <p className="text-muted-foreground">
                  Erstellen Sie Aufträge und weisen Sie sie Mitarbeitern zu
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
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
