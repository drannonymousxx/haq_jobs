import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  const isAuthPage = path === "/login" || path === "/signup";
  const isDashboardPage =
    path.startsWith("/dashboard") ||
    path.startsWith("/candidate") ||
    path.startsWith("/interview");

  const accessToken = request.cookies.get("sb-access-token")?.value;
  const refreshToken = request.cookies.get("sb-refresh-token")?.value;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  let sessionUser = null;
  let isSessionValid = false;
  let response = NextResponse.next();
  let cookiesToSet: Array<{ name: string; value: string; maxAge: number }> = [];
  let shouldClearCookies = false;

  if (accessToken) {
    const expired = isTokenExpired(accessToken);
    if (!expired) {
      // Validate token with Supabase server
      const { data: { user }, error } = await supabaseServer.auth.getUser(accessToken);
      if (user && !error) {
        sessionUser = user;
        isSessionValid = true;
      }
    }

    // Try refreshing if token is expired or getUser failed, and refresh token is available
    if (!isSessionValid && refreshToken) {
      try {
        const { data, error } = await supabaseServer.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (data.session && data.user && !error) {
          sessionUser = data.user;
          isSessionValid = true;

          // Queue new cookies to be set on the response
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
  } else if (refreshToken) {
    // Only refresh token exists, try refreshing to obtain new session
    try {
      const { data, error } = await supabaseServer.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (data.session && data.user && !error) {
        sessionUser = data.user;
        isSessionValid = true;

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

  // Resolve user role from verified user metadata
  const resolvedRole = sessionUser?.user_metadata?.role || "candidate";

  // 1. Authenticated user trying to access login/signup pages
  if (isSessionValid && isAuthPage) {
    const redirectUrl = resolvedRole === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
    response = NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  // 2. Unauthenticated user trying to access dashboard/candidate/interview pages
  else if (isDashboardPage && !isSessionValid) {
    // Avoid interrupting oauth authentication callback or api endpoints
    if (path.startsWith("/auth") || path.startsWith("/api")) {
      response = NextResponse.next();
    } else {
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
        response = NextResponse.redirect(new URL("/dashboard/recruiter", request.url));
      }
    } else if (resolvedRole === "candidate") {
      if (path.startsWith("/dashboard/recruiter")) {
        response = NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Apply cookie updates to the final response object
  if (shouldClearCookies) {
    response.cookies.set("sb-access-token", "", { path: "/", expires: new Date(0) });
    response.cookies.set("sb-refresh-token", "", { path: "/", expires: new Date(0) });
  } else {
    for (const cookie of cookiesToSet) {
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        maxAge: cookie.maxAge,
        sameSite: "lax",
        secure: true,
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

