"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth";

/**
 * AuthCookieSync — mounts once in the root layout.
 *
 * Responsibilities:
 * 1. Keep sb-access-token / sb-refresh-token cookies in sync with Supabase
 *    auth state so the server-side proxy (proxy.ts) can read them.
 * 2. Strip the `#access_token=...` hash fragment that Supabase's OAuth
 *    implicit-grant flow leaves in the URL after the first redirect lands
 *    on the landing page. Without this the hash persists on every navigation.
 */
export default function AuthCookieSync() {
  useEffect(() => {
    // Synchronously strip OAuth hash fragment from URL immediately on mount (<1s)
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setAuthCookies(session);
      } else if (event === "SIGNED_OUT") {
        clearAuthCookies();
      }

      // Re-check hash removal if session state updates
      if (
        (event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
        typeof window !== "undefined" &&
        window.location.hash.includes("access_token")
      ) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
