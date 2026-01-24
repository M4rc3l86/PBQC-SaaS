import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Anmelden",
  description: "Melden Sie sich bei Ihrem Konto an",
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Willkommen zurück</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Melden Sie sich bei Ihrem Konto an
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Noch kein Konto?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Jetzt registrieren
        </Link>
      </p>
    </>
  );
}
