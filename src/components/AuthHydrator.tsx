"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

/**
 * Populates the Zustand auth store once on mount by asking /api/auth/me.
 * Mounted once in the root layout so it runs on every page, including the
 * public marketing pages that otherwise have no way to know if the visitor
 * is logged in.
 */
export function AuthHydrator() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return null;
}
