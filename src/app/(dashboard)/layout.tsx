import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar - hidden on mobile, shown on desktop */}
      <aside className="hidden md:block md:w-64 lg:w-72">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Laden...</div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
