import { Metadata } from "next";
import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = {
  title: "Passwort aktualisieren",
  description: "Setzen Sie ein neues Passwort",
};

export default function UpdatePasswordPage() {
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Neues Passwort setzen
        </h1>
        <p className="text-sm text-muted-foreground">
          Geben Sie Ihr neues Passwort ein.
        </p>
      </div>

      <UpdatePasswordForm />
    </>
  );
}
