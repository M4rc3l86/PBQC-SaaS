import { Metadata } from "next";
import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = {
  title: "Passwort aktualisieren",
  description: "Setzen Sie ein neues Passwort",
};

export default function UpdatePasswordPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Neues Passwort setzen
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Geben Sie Ihr neues Passwort ein.
        </p>
      </div>

      <UpdatePasswordForm />
    </>
  );
}
