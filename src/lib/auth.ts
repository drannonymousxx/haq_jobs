import { supabase } from "./supabase";

/**
 * auth.ts — Centralised authentication utilities for HAQJobs
 *
 * Single source of truth for OAuth callbacks, session persistence,
 * role preservation, and auth cookie synchronization.
 */

const IS_DEV = process.env.NODE_ENV !== "production";

function logAuth(...args: any[]) {
  if (IS_DEV) {
    console.log("[HAQAuth]", ...args);
  }
}

/**
 * Returns the canonical site origin for auth redirects.
 */
function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

/**
 * Builds the full OAuth / magic-link callback URL.
 */
export function getAuthCallbackUrl(role?: "candidate" | "recruiter"): string {
  const origin = getSiteOrigin();
  const base = `${origin}/auth/callback`;
  return role ? `${base}?role=${role}` : base;
}

/**
 * Helper to determine if cookie should include Secure flag
 */
function getSecureFlag(): string {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

/**
 * Sets auth cookies in the browser safely across HTTP and HTTPS environments.
 * Synchronizes Supabase session tokens with the server-side middleware proxy.
 */
export function setAuthCookies(session: any) {
  if (typeof document === "undefined" || !session) return;

  const maxAge = session.expires_in || 3600;
  const secureFlag = getSecureFlag();
  
  if (session.access_token) {
    document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  }
  
  if (session.refresh_token) {
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
  }

  logAuth("Auth cookies synchronized. Expiration max-age:", maxAge);
}

/**
 * Clears auth cookies in the browser.
 */
export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  
  const secureFlag = getSecureFlag();
  document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
  document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
  document.cookie = `sb-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
  logAuth("Auth cookies cleared.");
}

/**
 * Shared redirection logic after a successful login, signup, or session restore.
 * Rule: Preserves existing database role for existing users under ALL circumstances.
 * Never mutates an established database role.
 */
export async function redirectAfterLogin(
  user: any, 
  session: any, 
  router: any, 
  fallbackRole?: "candidate" | "recruiter"
) {
  try {
    // 1. Fetch existing profile from database
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // 2. Database profile role is authoritative for existing users.
    // Fall back to user_metadata or fallbackRole only if profile is not yet created.
    const resolvedRole = profile?.role || user.user_metadata?.role || fallbackRole || "candidate";

    logAuth("Redirect decision resolved role:", resolvedRole, "(DB Profile:", profile?.role, ")");

    // 3. Sync auth metadata ONCE if missing or out of sync with DB role
    let currentSession = session;
    if (!user.user_metadata?.role || user.user_metadata.role !== resolvedRole) {
      try {
        await supabase.auth.updateUser({
          data: { role: resolvedRole }
        });
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          currentSession = newSession;
        }
        logAuth("Synchronized user_metadata.role to:", resolvedRole);
      } catch (metaErr) {
        console.error("[HAQAuth] Failed to sync user role metadata:", metaErr);
      }
    }

    // 4. Synchronize cookies before routing
    setAuthCookies(currentSession);

    // 5. Detect if user logged in on a portal that mismatches their authoritative DB role
    const isPortalMismatch = profile && fallbackRole && profile.role !== fallbackRole;
    if (isPortalMismatch) {
      logAuth(
        `[HAQAuth] Role Mismatch: User logged in on ${fallbackRole} portal, ` +
        `but DB profile is ${resolvedRole}. Redirecting directly to ${resolvedRole} dashboard once.`
      );
    }

    const basePath = resolvedRole === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
    const targetPath = isPortalMismatch ? `${basePath}?notice=role_redirect` : basePath;
    logAuth("Navigating user directly to:", targetPath);
    router.replace(targetPath);
  } catch (err) {
    console.error("[HAQAuth] Redirection after login failed:", err);
    router.replace("/dashboard");
  }
}

/**
 * Handles the client-side session check during page mounting on an auth portal.
 *
 * CROSSOVER GUARD: If an active session exists but its role does NOT match
 * the portal this component is mounted on (`portalRole`), we do NOT redirect.
 * The user stays on the current portal and sees its normal login/signup UI.
 * The caller receives `"mismatch"` and may render a contextual banner.
 *
 * ROLE RESOLUTION — uses the same priority order as redirectAfterLogin so
 * the portal-match decision and the routing decision can never disagree:
 *   1. profiles.role  (DB, authoritative single source of truth)
 *   2. user_metadata.role  (JWT cache, fallback for accounts missing a profile)
 *   3. If neither is set → "no-session" (unknown role, show portal UI, do not guess)
 *
 * The || "candidate" default has been deliberately removed. An absent role is
 * treated as "unverified" rather than silently coerced into a match.
 *
 * @param portalRole  The role this specific portal expects ("candidate" | "recruiter").
 * @returns "redirecting" | "mismatch" | "no-session"
 */
export async function handleSessionMountCheck(
  router: any,
  setCheckingAuth: (val: boolean) => void,
  portalRole: "candidate" | "recruiter"
): Promise<"redirecting" | "mismatch" | "no-session"> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      logAuth("Mounted page check: No active session found.");
      setCheckingAuth(false);
      return "no-session";
    }

    // ── Step 1: resolve role from DB (authoritative) ────────────────────
    // One DB read per auth-page mount. This keeps the crossover check and the
    // redirect decision (redirectAfterLogin also reads profiles.role) in sync.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    // ── Step 2: fallback to JWT cache if DB has no profile yet ──────────
    // This covers brand-new OAuth users before their profile row is committed.
    const metaRole = session.user.user_metadata?.role;
    const resolvedRole: string | null = profile?.role || metaRole || null;

    logAuth(
      "Mounted page check: DB role =", profile?.role ?? "(none)",
      "| JWT role =", metaRole ?? "(none)",
      "| resolved =", resolvedRole ?? "(unknown)",
      "| portal expects =", portalRole
    );

    // ── Step 3: unknown role — cannot verify, show portal UI ────────────
    if (!resolvedRole) {
      logAuth("Role is unknown — no profile and no user_metadata. Showing portal UI.");
      setCheckingAuth(false);
      return "no-session";
    }

    // ── Step 4: mismatch guard ──────────────────────────────────────────
    if (resolvedRole !== portalRole) {
      logAuth(
        "Role mismatch on mount — staying on portal.",
        "Resolved role:", resolvedRole,
        "| Portal role:", portalRole
      );
      setCheckingAuth(false);
      return "mismatch";
    }

    // ── Step 5: match — auto-restore session and redirect ───────────────
    // redirectAfterLogin will re-query profiles.role for its routing decision,
    // which is the same value we just resolved above, so they are guaranteed to agree.
    logAuth("Mounted page check: role matches portal. Restoring session for user:", session.user.id);
    setAuthCookies(session);
    await redirectAfterLogin(session.user, session, router, portalRole);
    return "redirecting";

  } catch (err) {
    logAuth("Mounted page check error:", err);
    setCheckingAuth(false);
    return "no-session";
  }
}


/**
 * Shared logout helper. Clears local Supabase auth and response cookies synchronously, then redirects to /login.
 */
export async function signOut(router: any) {
  try {
    logAuth("User initiated sign out.");
    clearAuthCookies();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[HAQAuth] Error signing out from Supabase:", err);
  } finally {
    router.push("/login");
    router.refresh();
  }
}

// NOTE: Cookie synchronization is handled exclusively by AuthCookieSync.tsx
// (mounted in the root layout). Do not add a second listener here — it would
// create a duplicate subscription and double-fire cookie writes on every event.
