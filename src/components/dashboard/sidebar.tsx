"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { getNavItemsForRole } from "./nav-items";
import { usePendingReviewCount } from "@/hooks/use-pending-review-count";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  const { count: pendingCount } = usePendingReviewCount();
  const navItems = getNavItemsForRole(role);

  return (
    <div
      className={cn(
        "flex flex-col gap-0 border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            const badge = item.showBadge ? pendingCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.title}</span>
                {badge > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className="ml-auto shrink-0"
                  >
                    {badge > 99 ? "99+" : badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
