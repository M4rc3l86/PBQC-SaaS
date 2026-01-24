import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getInvitation } from "@/lib/auth/invite";
import { getUser } from "@/lib/auth/actions";
import { InviteAcceptForm } from "./invite-accept-form";

export const metadata: Metadata = {
  title: "Einladung annehmen",
  description: "Treten Sie einer Organisation bei",
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const result = await getInvitation(token);
  const user = await getUser();

  if (result.error) {
    return (
      <>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-destructive">
            Ungültige Einladung
          </h1>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80 link-underline transition-colors"
          >
            Zur Anmeldung
          </Link>
        </div>
      </>
    );
  }

  const invitation = result.invitation!;
  const organization = invitation.organization as { id: string; name: string };

  // If user is logged in with matching email, show accept button
  if (user && user.email?.toLowerCase() === invitation.email.toLowerCase()) {
    return (
      <>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Einladung annehmen
          </h1>
          <p className="text-sm text-muted-foreground">
            Sie wurden eingeladen,{" "}
            <strong className="text-foreground">{organization.name}</strong> als{" "}
            <strong className="text-foreground">
              {invitation.role === "manager" ? "Manager" : "Mitarbeiter"}
            </strong>{" "}
            beizutreten.
          </p>
        </div>

        <InviteAcceptForm token={token} organizationName={organization.name} />
      </>
    );
  }

  // If user is logged in with different email
  if (user && user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-accent">
            Falsche E-Mail-Adresse
          </h1>
          <p className="text-sm text-muted-foreground">
            Diese Einladung wurde an{" "}
            <strong className="text-foreground">{invitation.email}</strong>{" "}
            gesendet, aber Sie sind mit{" "}
            <strong className="text-foreground">{user.email}</strong>{" "}
            angemeldet.
          </p>
          <p className="text-sm text-muted-foreground">
            Bitte melden Sie sich mit der richtigen E-Mail-Adresse an.
          </p>
        </div>

        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="block font-semibold text-primary hover:text-primary/80 link-underline transition-colors"
          >
            Mit anderer E-Mail anmelden
          </Link>
        </div>
      </>
    );
  }

  // User is not logged in - redirect to register with invitation context
  redirect(
    `/register?invite=${token}&email=${encodeURIComponent(invitation.email)}`,
  );
}
