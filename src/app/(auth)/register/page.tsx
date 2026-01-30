import { RegisterForm } from "@/components/auth/RegisterForm"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Konto erstellen
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Starten Sie noch heute Ihre 14-tägige kostenlose Testphase
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Haben Sie bereits ein Konto?{' '}
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
