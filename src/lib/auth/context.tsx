"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { OrgMember, Organization, OrgRole } from "@/types/database";

interface AuthContextValue {
  user: User | null;
  membership: OrgMember | null;
  organization: Organization | null;
  role: OrgRole | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  clearState: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<OrgMember | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const clearState = useCallback(() => {
    setUser(null);
    setMembership(null);
    setOrganization(null);
    // Clear any localStorage items related to auth
    if (typeof window !== "undefined") {
      localStorage.removeItem("pbqc-last-org");
    }
  }, []);

  const fetchMembership = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("org_members")
        .select(
          `
        *,
        organization:organizations(*)
      `,
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (data) {
        setMembership(data as OrgMember);
        setOrganization(
          (data as OrgMember & { organization: Organization }).organization,
        );
      } else {
        setMembership(null);
        setOrganization(null);
      }
    },
    [supabase],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser) {
      setUser(currentUser);
      await fetchMembership(currentUser.id);
    } else {
      clearState();
    }
    setIsLoading(false);
  }, [supabase, fetchMembership, clearState]);

  useEffect(() => {
    let mounted = true;

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (mounted) {
        if (currentUser) {
          setUser(currentUser);
          fetchMembership(currentUser.id).finally(() => {
            if (mounted) setIsLoading(false);
          });
        } else {
          clearState();
          setIsLoading(false);
        }
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        clearState();
        setIsLoading(false);
      } else if (session?.user) {
        setUser(session.user);
        await fetchMembership(session.user.id);
        setIsLoading(false);
      } else {
        clearState();
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchMembership, clearState]);

  const value: AuthContextValue = {
    user,
    membership,
    organization,
    role: membership?.role ?? null,
    isLoading,
    refresh,
    clearState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
