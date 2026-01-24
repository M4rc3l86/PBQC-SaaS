"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface UseOnboardingOptions {
  enabled?: boolean;
  redirectTo?: string;
}

/**
 * Hook to check if user needs onboarding (no organization membership)
 * Redirects to onboarding page if user is authenticated but has no org
 */
export function useOnboarding({
  enabled = true,
  redirectTo = "/onboarding",
}: UseOnboardingOptions = {}) {
  const router = useRouter();
  const { membership, isLoading } = useAuth();

  const needsOnboarding = membership === null;

  useEffect(() => {
    if (!enabled || isLoading) return;

    if (needsOnboarding) {
      router.replace(redirectTo);
    }
  }, [enabled, isLoading, needsOnboarding, router, redirectTo]);

  return {
    isLoading,
    needsOnboarding,
    membership,
  };
}
