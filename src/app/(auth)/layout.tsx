import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-primary via-primary/95 to-primary/90 auth-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo variant="white" size="lg" />

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Qualitätskontrolle
              <br />
              <span className="text-white/80">neu definiert</span>
            </h2>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Professionelle Fotodokumentation und Berichterstattung für die Gebäudereinigung.
              Einfach, effizient, überzeugend.
            </p>

            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/60 uppercase tracking-wider">Unternehmen</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-sm text-white/60 uppercase tracking-wider">Berichte/Monat</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm text-white/60 uppercase tracking-wider">Verfügbarkeit</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} PBQC. Alle Rechte vorbehalten.
          </div>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile Logo */}
        <div className="lg:hidden p-6 flex justify-center">
          <Logo size="md" />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
