import { Logo } from '@/components/auth/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between border-r bg-zinc-950 p-12 text-zinc-50">
        <Logo href="/" className="text-zinc-50" />

        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Qualitätskontrolle einfach gemacht
          </h1>
          <p className="text-lg text-zinc-400">
            Optimieren Sie Ihre Inspektionsabläufe, verwalten Sie Checklisten und
            halten Sie hohe Standards mit unserer umfassenden Qualitätskontrollplattform.
          </p>
        </div>

        <div className="text-sm text-zinc-500">
          © {new Date().getFullYear()} PBQC. Alle Rechte vorbehalten.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo href="/" />
        </div>

        {children}

        {/* Mobile footer */}
        <div className="mt-8 text-center text-sm text-zinc-500 lg:hidden">
          © {new Date().getFullYear()} PBQC. Alle Rechte vorbehalten.
        </div>
      </div>
    </div>
  )
}
