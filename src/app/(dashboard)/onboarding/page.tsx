import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Willkommen bei PBQC!</CardTitle>
          <CardDescription className="text-base">
            Erstellen Sie Ihre Organisation, um mit der Qualitätskontrolle zu
            beginnen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Das Onboarding wird in Phase 2 implementiert. Folgende Funktionen
            sind geplant:
          </p>
          <ul className="text-sm text-muted-foreground text-left space-y-2 list-disc list-inside">
            <li>Organisation erstellen</li>
            <li>Organisationsname und Einstellungen konfigurieren</li>
            <li>Team-Mitglieder einladen</li>
            <li>Erste Checkliste erstellen</li>
          </ul>
          <Button className="w-full" disabled>
            Demnächst verfügbar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
