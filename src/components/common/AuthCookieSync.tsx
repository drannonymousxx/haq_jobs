"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth";

export default function AuthCookieSync() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setAuthCookies(session);
      } else {
        clearAuthCookies();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

