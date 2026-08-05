import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const IS_DEV = process.env.NODE_ENV !== "production";

function logProxy(...args: any[]) {
  if (IS_DEV) {
    console.log("[HAQAuth:Proxy]", ...args);
  }
}

// Helper to extract payload from Supabase JWT access token
function getPayloadFromToken(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

// Helper to check if a JWT access token has expired
function isTokenExpired(token: string): boolean {
  const payload = getPayloadFromToken(token);
  if (!payload || !payload.exp) return true;
  // Expire 10 seconds early to prevent clock skew issues
  const now = Math.floor(Date.now() / 1000);
  return now >= (payload.exp - 10);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path.startsWith("/signup");
  const isDashboardPage =
    path.startsWith("/dashboard") ||
    path.startsWith("/candidate") ||
    path.startsWith("/interview");

  const accessToken = request.cookies.get("sb-access-token")?.value;
  const refreshToken = request.cookies.get("sb-refresh-token")?.value;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let sessionUser: any = null;
  let isSessionValid = false;
  let response = NextResponse.next();
  let cookiesToSet: Array<{ name: string; value: string; maxAge: number }> = [];
  let shouldClearCookies = false;

  const isProduction = process.env.NODE_ENV === "production";

  if (accessToken && supabaseUrl && supabaseAnonKey) {
    const expired = isTokenExpired(accessToken);
    if (!expired) {
      // Decode the JWT payload locally — no network round-trip needed.
      // We already verified the token is not expired; role guards use user_metadata only.
      const payload = getPayloadFromToken(accessToken);
      if (payload && payload.sub) {
        sessionUser = {
          id: payload.sub,
          email: payload.email,
          user_metadata: payload.user_metadata || {},
        };
        isSessionValid = true;
        logProxy("Session validated via local JWT decode for user:", payload.sub);
      }
    } else {
      logProxy("Access token is expired. Will attempt refresh token flow.");
    }

    // Try refreshing if token is expired or getUser failed, and refresh token is available
    if (!isSessionValid && refreshToken && supabaseUrl && supabaseAnonKey) {
      try {
        const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
        });
        const { data, error } = await supabaseServer.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (data.session && data.user && !error) {
          sessionUser = data.user;
          isSessionValid = true;
          logProxy("Session refreshed successfully for user:", data.user.id);

          cookiesToSet.push({
            name: "sb-access-token",
            value: data.session.access_token,
            maxAge: data.session.expires_in || 3600,
          });
          if (data.session.refresh_token) {
            cookiesToSet.push({
              name: "sb-refresh-token",
              value: data.session.refresh_token,
              maxAge: 604800,
            });
          }
        } else {
          logProxy("Session refresh failed or invalid token.");
          shouldClearCookies = true;
        }
      } catch (refreshErr) {
        logProxy("Refresh exception:", refreshErr);
        shouldClearCookies = true;
      }
    }
  } else if (refreshToken && supabaseUrl && supabaseAnonKey) {
    // Only refresh token exists, try refreshing to obtain new session
    try {
      const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      const { data, error } = await supabaseServer.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (data.session && data.user && !error) {
        sessionUser = data.user;
        isSessionValid = true;
        logProxy("Session restored via refresh_token for user:", data.user.id);

        cookiesToSet.push({
          name: "sb-access-token",
          value: data.session.access_token,
          maxAge: data.session.expires_in || 3600,
        });
        if (data.session.refresh_token) {
          cookiesToSet.push({
            name: "sb-refresh-token",
            value: data.session.refresh_token,
            maxAge: 604800,
          });
        }
      } else {
        shouldClearCookies = true;
      }
    } catch (refreshErr) {
      shouldClearCookies = true;
    }
  }

  // Resolve user role from verified JWT user_metadata without DB lookup
  const resolvedRole = sessionUser?.user_metadata?.role || "candidate";

  // 1. Authenticated user trying to access login/signup pages
  if (isSessionValid && isAuthPage) {
    const redirectUrl = resolvedRole === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
    logProxy("Authenticated user on auth page (", path, "). Redirecting to:", redirectUrl);
    response = NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  // 2. Unauthenticated user trying to access dashboard/candidate/interview pages
  else if (isDashboardPage && !isSessionValid) {
    if (path.startsWith("/auth") || path.startsWith("/api")) {
      response = NextResponse.next();
    } else {
      logProxy("Unauthenticated access attempt to protected path (", path, "). Redirecting to /login.");
      response = NextResponse.redirect(new URL("/login", request.url));
      shouldClearCookies = true;
    }
  }
  // 3. Authenticated user on wrong dashboard layout
  else if (isSessionValid) {
    if (resolvedRole === "recruiter") {
      const isCandidateOnly =
        path === "/dashboard" ||
        path.startsWith("/dashboard/jobs") ||
        path.startsWith("/dashboard/applied") ||
        path.startsWith("/dashboard/profile") ||
        path.startsWith("/dashboard/discover") ||
        path.startsWith("/dashboard/refer");
      if (isCandidateOnly) {
        logProxy("Recruiter accessed candidate path (", path, "). Redirecting to /dashboard/recruiter.");
        response = NextResponse.redirect(new URL("/dashboard/recruiter", request.url));
      }
    } else if (resolvedRole === "candidate") {
      if (path.startsWith("/dashboard/recruiter")) {
        logProxy("Candidate accessed recruiter path (", path, "). Redirecting to /dashboard.");
        response = NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Apply cookie updates to the final response object
  if (shouldClearCookies) {
    logProxy("Clearing authentication cookies on response.");
    response.cookies.set("sb-access-token", "", { path: "/", expires: new Date(0) });
    response.cookies.set("sb-refresh-token", "", { path: "/", expires: new Date(0) });
  } else {
    for (const cookie of cookiesToSet) {
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        maxAge: cookie.maxAge,
        sameSite: "lax",
        secure: isProduction,
      });
    }
  }

  return response;
}

// Config matcher to optimize middleware execution
export const config = {
  matcher: [
    "/login/:path*",
    "/signup/:path*",
    "/dashboard/:path*",
    "/candidate/:path*",
    "/interview/:path*",
  ],
};
