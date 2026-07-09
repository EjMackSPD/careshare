"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CareShareUser } from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: CareShareUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export async function payloadLogin(email: string, password: string) {
  const response = await fetch("/payload-api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Invalid email or password",
    };
  }

  return {
    ok: true,
    error: null,
  };
}

export async function payloadLogout() {
  await fetch("/payload-api/users/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CareShareUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    const data = await response.json();
    setUser(data.user ?? null);
    setStatus(data.user ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      status,
      refresh,
    }),
    [refresh, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function useSession() {
  const { user, status, refresh } = useAuth();

  const data = useMemo(() => (user ? { user } : null), [user]);

  return {
    data,
    status,
    update: refresh,
  };
}
