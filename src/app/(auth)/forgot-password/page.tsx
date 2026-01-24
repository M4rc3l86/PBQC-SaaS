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
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Passwort vergessen?</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Erinnern Sie sich an Ihr Passwort?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Zurück zur Anmeldung
        </Link>
      </p>
    </>
  );
}
