import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Registrieren",
  description: "Erstellen Sie ein neues Konto",
};

export default function RegisterPage() {
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Konto erstellen
        </h1>
        <p className="text-sm text-muted-foreground">
          Starten Sie Ihre 14-tägige kostenlose Testversion
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Bereits ein Konto?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary/80 link-underline transition-colors"
        >
          Jetzt anmelden
        </Link>
      </p>
    </>
  );
}
