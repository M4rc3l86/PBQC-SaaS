"use client";

import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { organization } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6",
        className
      )}
    >
      {/* Mobile menu trigger */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Organization name - hidden on mobile, shown in mobile nav */}
      <div className="hidden md:flex">
        {organization && (
          <h1 className="text-lg font-semibold">{organization.name}</h1>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <UserMenu />
    </header>
  );
}
