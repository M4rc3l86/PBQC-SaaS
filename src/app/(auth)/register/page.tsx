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
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Konto erstellen</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Starten Sie Ihre 14-tägige kostenlose Testversion
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Bereits ein Konto?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Jetzt anmelden
        </Link>
      </p>
    </>
  );
}
