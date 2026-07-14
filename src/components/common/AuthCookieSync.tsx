"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCookieSync() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const maxAge = session.expires_in || 3600;
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
        if (session.refresh_token) {
          document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        }
        const role = session.user?.user_metadata?.role || "candidate";
        document.cookie = `sb-user-role=${role}; path=/; max-age=604800; SameSite=Lax; Secure`;
      } else {
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
        document.cookie = "sb-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
