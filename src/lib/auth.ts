import { supabase } from "./supabase";

/**
 * auth.ts — Centralised authentication utilities for HAQJobs
 *
 * This module owns all redirect URL generation logic so there is a single
 * source of truth for every OAuth / magic-link callback.
 *
 * Priority order for determining the site origin:
 *  1. NEXT_PUBLIC_SITE_URL  — set explicitly in production deployment env vars
 *  2. window.location.origin — available in the browser (works for any domain)
 *  3. http://localhost:3000  — last-resort local development fallback only
 *
 * NEVER returns a localhost URL in production.
 */

/**
 * Returns the canonical site origin for auth redirects.
 *
 * - In production deployments, `NEXT_PUBLIC_SITE_URL` must be set to the
 *   deployed domain (e.g. https://haqjobs.vercel.app).
 * - In the browser, `window.location.origin` is always correct because it
 *   reflects the actual URL the user is visiting.
 * - The localhost fallback only activates in a non-browser context during
 *   local development (e.g. SSR) — it is never reached in production.
 */
function getSiteOrigin(): string {
  // 1. Explicit production env var — most reliable in any context
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    // Strip trailing slash for consistent concatenation
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // 2. Browser window — always correct in client components
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 3. Local dev SSR fallback — never reached in a real deployment
  return "http://localhost:3000";
}

/**
 * Builds the full OAuth / magic-link callback URL.
 *
 * @param role - Optional role query param ('candidate' | 'recruiter')
 *               to thread through the callback into profile creation.
 * @returns     Full absolute URL pointing to /auth/callback
 *
 * @example
 *   getAuthCallbackUrl()                 // "https://haqjobs.vercel.app/auth/callback"
 *   getAuthCallbackUrl("candidate")      // "https://haqjobs.vercel.app/auth/callback?role=candidate"
 *   getAuthCallbackUrl("recruiter")      // "https://haqjobs.vercel.app/auth/callback?role=recruiter"
 */
export function getAuthCallbackUrl(role?: "candidate" | "recruiter"): string {
  const origin = getSiteOrigin();
  const base = `${origin}/auth/callback`;
  return role ? `${base}?role=${role}` : base;
}

/**
 * Sets auth cookies in the browser.
 * This is used to synchronously sync Supabase session tokens with the server-side middleware
 * to prevent race conditions during redirect.
 */
export function setAuthCookies(session: any) {
  if (typeof document === "undefined") return;

  const maxAge = session?.expires_in || 3600;
  
  if (session?.access_token) {
    document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
  }
  
  if (session?.refresh_token) {
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
  }
}

/**
 * Clears auth cookies in the browser.
 */
export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  
  document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
  document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
  // Wiping legacy role cookie too, just in case
  document.cookie = "sb-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
}

/**
 * Shared redirection logic after a successful login or signup.
 * Resolves role from database, updates metadata if out of sync, sets cookies, and navigates.
 */
export async function redirectAfterLogin(user: any, session: any, router: any, forceRole?: "candidate" | "recruiter") {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = forceRole || profile?.role || user.user_metadata?.role || "candidate";

    // If role is forced and differs from database profile role, update it
    if (profile && forceRole && profile.role !== forceRole) {
      try {
        await supabase
          .from("profiles")
          .update({ role: forceRole })
          .eq("id", user.id);
      } catch (err) {
        console.error("Failed to update profile role in DB:", err);
      }
    }

    // Sync auth metadata if missing/mismatched
    let currentSession = session;
    if (!user.user_metadata?.role || user.user_metadata.role !== role) {
      try {
        await supabase.auth.updateUser({
          data: { role }
        });
        // Retrieve the refreshed/updated session with the new JWT
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          currentSession = newSession;
        }
      } catch (err) {
        console.error("Failed to sync user role metadata:", err);
      }
    }

    // Write cookies synchronously before routing
    setAuthCookies(currentSession);

    // Redirect to correct dashboard path
    const targetPath = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
    router.push(targetPath);
    router.refresh();
  } catch (err) {
    console.error("Redirection after login failed:", err);
    // Fallback redirect
    router.push("/dashboard");
    router.refresh();
  }
}

/**
 * Handles the client-side session check during page mounting.
 * If user is authenticated, directs to their dashboard, otherwise resets loading states.
 */
export async function handleSessionMountCheck(
  router: any,
  setCheckingAuth: (val: boolean) => void,
  forceRole?: "candidate" | "recruiter"
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await redirectAfterLogin(session.user, session, router, forceRole);
    } else {
      setCheckingAuth(false);
    }
  } catch (err) {
    setCheckingAuth(false);
  }
}

/**
 * Shared logout helper. Clears local Supabase auth and response cookies synchronously, then redirects.
 */
export async function signOut(router: any) {
  try {
    clearAuthCookies();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error signing out from Supabase:", err);
  } finally {
    router.push("/login");
    router.refresh();
  }
}
