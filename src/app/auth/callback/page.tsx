"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { convertRecruiterLead } from "@/lib/leadService";
import { Loader2 } from "lucide-react";

function AuthCallbackComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Initializing secure session...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleAuthCallback() {
      try {
        // 1. Get the current active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (active) setError(sessionError.message);
          return;
        }

        if (!session || !session.user) {
          // No session yet. Let's subscribe to auth state changes in case it's loading async
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (event === "SIGNED_IN" && currentSession && currentSession.user) {
              subscription.unsubscribe();
              await processUserProfile(currentSession.user);
            }
          });
          
          // Fallback timer to check if session appears in 5 seconds, otherwise redirect to login
          setTimeout(() => {
            if (active && !session) {
              subscription.unsubscribe();
              setError("Session timeout. Please try logging in again.");
              setTimeout(() => router.push("/login"), 3000);
            }
          }, 5000);
          
          return;
        }

        // Session exists immediately
        await processUserProfile(session.user);

      } catch (err: any) {
        if (active) setError(err.message || "An unexpected error occurred during redirect.");
      }
    }

    async function processUserProfile(user: any) {
      if (!active) return;
      setStatus("Verifying your profile...");

      try {
        // 2. Query the profile table to see if a record already exists
        const { data: profile, error: profileQueryError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        // 3. Extract role from URL parameter (fallback to 'candidate')
        const roleParam = searchParams.get("role") || "candidate";
        const targetRole = roleParam === "recruiter" ? "recruiter" : "candidate";

        if (!profile) {
          // First time OAuth signup: Create profile record
          setStatus("Creating your HAQJobs profile...");
          
          const fullName = user.user_metadata.full_name || user.user_metadata.name || "Google User";
          
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              full_name: fullName,
              email: user.email || "",
              role: targetRole,
              company_name: null,
              designation: null,
              created_at: new Date().toISOString()
            });

          const getRedirectPath = (role: string) => role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";

          if (insertError) {
            // Note: If profile creation fails because migration wasn't run yet, 
            // log the error but still redirect so UI is fully functional.
            console.error("Profile insertion error:", insertError);
            setStatus("Redirecting to dashboard...");
            router.push(getRedirectPath(targetRole));
          } else {
            // Link existing lead if recruiter
            if (targetRole === "recruiter" && user.email) {
              try {
                await convertRecruiterLead(user.email, user.id);
              } catch (leadErr) {
                console.error("Failed to link recruiter lead during OAuth callback:", leadErr);
              }
            }
            setStatus("Profile created! Redirecting...");
            router.push(getRedirectPath(targetRole));
          }
        } else {
          // Profile exists: Redirect to the existing role dashboard (ignores URL role param to prevent hijacking)
          setStatus("Welcome back! Redirecting to dashboard...");
          const getRedirectPath = (role: string) => role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
          router.push(getRedirectPath(profile.role));
        }

        router.refresh();
      } catch (err: any) {
        setError("Error setting up user profile: " + err.message);
      }
    }

    handleAuthCallback();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="bg-brand-card p-8 rounded-3xl border border-brand-border shadow-xl max-w-sm w-full text-center flex flex-col items-center">
      {error ? (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-brand-text font-poppins">Authentication Error</h1>
          <p className="text-sm text-brand-text-muted leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-5 py-2.5 bg-black hover:bg-slate-900 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#B63106] mx-auto" />
          <h1 className="text-xl font-bold text-brand-text font-poppins">Completing Sign In</h1>
          <p className="text-sm text-brand-text-muted font-medium">{status}</p>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg p-6">
      <Suspense fallback={
        <div className="bg-brand-card p-8 rounded-3xl border border-brand-border shadow-xl max-w-sm w-full text-center flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#B63106] mx-auto" />
          <h1 className="text-xl font-bold text-brand-text font-poppins">Loading authentication...</h1>
        </div>
      }>
        <AuthCallbackComponent />
      </Suspense>
    </div>
  );
}
