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
