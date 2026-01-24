import { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Passwort vergessen",
  description: "Setzen Sie Ihr Passwort zurück",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Passwort vergessen?
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum
          Zurücksetzen Ihres Passworts.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-muted-foreground">
        Erinnern Sie sich an Ihr Passwort?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary/80 link-underline transition-colors"
        >
          Zurück zur Anmeldung
        </Link>
      </p>
    </>
  );
}
