"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building,
  FileText,
  Briefcase,
  CheckCircle,
  Share,
  Users,
  Settings,
  CreditCard,
} from "lucide-react";
import type { OrgRole } from "@/types/database";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  requiredRole?: "admin" | "owner";
  showBadge?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Übersicht",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Standorte",
    href: "/dashboard/sites",
    icon: Building,
    requiredRole: "admin",
  },
  {
    title: "Vorlagen",
    href: "/dashboard/templates",
    icon: FileText,
    requiredRole: "admin",
  },
  {
    title: "Aufträge",
    href: "/dashboard/jobs",
    icon: Briefcase,
    requiredRole: "admin",
  },
  {
    title: "Prüfung",
    href: "/dashboard/review",
    icon: CheckCircle,
    requiredRole: "admin",
    showBadge: true,
  },
  {
    title: "Berichte",
    href: "/dashboard/reports",
    icon: Share,
    requiredRole: "admin",
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
    requiredRole: "owner",
  },
  {
    title: "Einstellungen",
    href: "/dashboard/settings",
    icon: Settings,
    requiredRole: "owner",
  },
  {
    title: "Abrechnung",
    href: "/dashboard/billing",
    icon: CreditCard,
    requiredRole: "owner",
  },
];

export function getNavItemsForRole(role: OrgRole | null): NavItem[] {
  if (!role) return [];

  const isAdmin = role === "owner" || role === "manager";
  const isOwner = role === "owner";

  return navItems.filter((item) => {
    if (item.requiredRole === "owner") {
      return isOwner;
    }
    if (item.requiredRole === "admin") {
      return isAdmin;
    }
    return true;
  });
}

export { navItems };
