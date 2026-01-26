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
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Standorte",
    href: "/sites",
    icon: Building,
    requiredRole: "admin",
  },
  {
    title: "Vorlagen",
    href: "/templates",
    icon: FileText,
    requiredRole: "admin",
  },
  {
    title: "Aufträge",
    href: "/jobs",
    icon: Briefcase,
    requiredRole: "admin",
  },
  {
    title: "Prüfung",
    href: "/review",
    icon: CheckCircle,
    requiredRole: "admin",
    showBadge: true,
  },
  {
    title: "Berichte",
    href: "/reports",
    icon: Share,
    requiredRole: "admin",
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
    requiredRole: "owner",
  },
  {
    title: "Einstellungen",
    href: "/settings",
    icon: Settings,
    requiredRole: "owner",
  },
  {
    title: "Abrechnung",
    href: "/billing",
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
