"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { OrgRole } from "@/types/database";

type RequiredRole = OrgRole | OrgRole[];

interface UseRoleGuardOptions {
  requiredRoles: RequiredRole;
  redirectTo?: string;
  enabled?: boolean;
}

/**
 * Client-side hook for role-based route protection
 * Redirects to unauthorized page if user doesn't have required role
 */
export function useRoleGuard({
  requiredRoles,
  redirectTo = "/unauthorized",
  enabled = true,
}: UseRoleGuardOptions) {
  const router = useRouter();
  const { role, isLoading } = useAuth();

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const hasRequiredRole = role !== null && roles.includes(role);

  useEffect(() => {
    if (!enabled || isLoading) return;

    if (!hasRequiredRole) {
      router.replace(redirectTo);
    }
  }, [enabled, isLoading, hasRequiredRole, router, redirectTo]);

  return {
    isLoading,
    hasRequiredRole,
    role,
  };
}

/**
 * Hook to check if user is an admin (owner or manager)
 */
export function useAdminGuard(options?: {
  redirectTo?: string;
  enabled?: boolean;
}) {
  return useRoleGuard({
    requiredRoles: ["owner", "manager"],
    ...options,
  });
}

/**
 * Hook to check if user is the owner
 */
export function useOwnerGuard(options?: {
  redirectTo?: string;
  enabled?: boolean;
}) {
  return useRoleGuard({
    requiredRoles: "owner",
    ...options,
  });
}

/**
 * Hook to check if user is a worker
 */
export function useWorkerGuard(options?: {
  redirectTo?: string;
  enabled?: boolean;
}) {
  return useRoleGuard({
    requiredRoles: "worker",
    ...options,
  });
}
