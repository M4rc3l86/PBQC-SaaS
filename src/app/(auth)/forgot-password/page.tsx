import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Reset your password
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          We&apos;ll send you a reset link to your email
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
