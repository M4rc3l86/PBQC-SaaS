import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Neues Passwort festlegen
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Geben Sie unten Ihr neues Passwort ein
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Erinnern Sie sich an Ihr Passwort?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Anmelden
        </Link>
      </p>
    </div>
  )
}
