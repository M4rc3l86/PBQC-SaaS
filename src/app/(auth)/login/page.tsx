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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Willkommen zurück
        </h1>
        <p className="text-sm text-muted-foreground">
          Melden Sie sich bei Ihrem Konto an
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Noch kein Konto?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:text-primary/80 link-underline transition-colors"
        >
          Jetzt registrieren
        </Link>
      </p>
    </>
  );
}
