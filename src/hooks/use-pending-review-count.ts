"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Job } from "@/types/database";

interface UsePendingReviewCountResult {
  count: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch the count of jobs with status='submitted' for the user's organization
 * Used to display a badge on the Review navigation item
 */
export function usePendingReviewCount(): UsePendingReviewCountResult {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { organization } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function fetchPendingCount() {
      if (!organization) {
        setCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        const { count, error } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("org_id", organization.id)
          .eq("status", "submitted");

        if (error) throw error;

        if (mounted) {
          setCount(count ?? 0);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e : new Error("Unknown error"));
          setCount(0);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPendingCount();

    return () => {
      mounted = false;
    };
  }, [organization]);

  return { count, isLoading, error };
}

/**
 * Hook to subscribe to real-time updates for pending review count
 * Uses Supabase realtime subscription to update count when jobs change
 */
export function usePendingReviewCountSubscription(): UsePendingReviewCountResult {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { organization } = useAuth();

  useEffect(() => {
    if (!organization) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let mounted = true;

    async function fetchInitialCount() {
      if (!organization) {
        setCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { count, error } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("org_id", organization.id)
          .eq("status", "submitted");

        if (error) throw error;

        if (mounted) {
          setCount(count ?? 0);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e : new Error("Unknown error"));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialCount();

    // Subscribe to changes on jobs table
    const channel = supabase
      .channel("pending-review-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
          filter: `org_id=eq.${organization?.id}`,
        },
        async (payload) => {
          // Only refetch if the status changed to/from 'submitted'
          const job = payload.new as Job | null;
          const oldJob = payload.old as Job | null;

          const statusChanged =
            job?.status !== oldJob?.status &&
            (job?.status === "submitted" || oldJob?.status === "submitted");

          if (statusChanged && mounted) {
            fetchInitialCount();
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [organization]);

  return { count, isLoading, error };
}
