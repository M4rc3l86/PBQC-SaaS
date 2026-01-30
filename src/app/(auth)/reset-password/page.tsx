import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Set new password
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter your new password below
        </p>
      </div>

      <ResetPasswordForm />

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
