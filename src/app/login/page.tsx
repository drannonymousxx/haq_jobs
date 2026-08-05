"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setAuthCookies } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setAuthCookies(session);
          // Query profile to determine role
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          const role = profile?.role || session.user.user_metadata?.role || "candidate";
          const target = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
          router.replace(target);
        } else {
          // Unauthenticated: send to candidate login portal (default entry point)
          router.replace("/signup/candidate?mode=login");
        }
      } catch (err) {
        router.replace("/signup/candidate?mode=login");
      }
    }

    checkAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#B63106]" />
      <p className="text-sm font-semibold text-brand-text-muted font-poppins">Checking authentication status...</p>
    </div>
  );
}
