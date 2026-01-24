"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { getNavItemsForRole } from "./nav-items";
import { usePendingReviewCount } from "@/hooks/use-pending-review-count";
import { useAuth } from "@/hooks/use-auth";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role, organization } = useAuth();
  const { count: pendingCount } = usePendingReviewCount();
  const navItems = getNavItemsForRole(role);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            {organization && (
              <SheetTitle className="text-base font-normal text-muted-foreground">
                {organization.name}
              </SheetTitle>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              const badge = item.showBadge ? pendingCount : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-foreground"
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
      </SheetContent>
    </Sheet>
  );
}
