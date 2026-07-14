import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Read Supabase auth session tokens from cookies
  const accessToken = request.cookies.get("sb-access-token")?.value;
  const userRole = request.cookies.get("sb-user-role")?.value;

  const isAuthPage = path === "/login" || path.startsWith("/signup");
  const isDashboardPage =
    path.startsWith("/dashboard") ||
    path.startsWith("/candidate") ||
    path.startsWith("/interview");

  // 1. Authenticated user trying to access login/signup pages
  if (accessToken && isAuthPage) {
    const redirectUrl = userRole === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // 2. Unauthenticated user trying to access dashboard/candidate/interview pages
  if (!accessToken && isDashboardPage) {
    // Avoid interrupting oauth authentication callback or api endpoints
    if (path.startsWith("/auth") || path.startsWith("/api")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Authenticated user on wrong dashboard layout (recruiter on candidate dashboard or vice versa)
  if (accessToken && userRole) {
    if (path === "/dashboard" && userRole === "recruiter") {
      return NextResponse.redirect(new URL("/dashboard/recruiter", request.url));
    }
    if (path.startsWith("/dashboard/recruiter") && userRole === "candidate") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Config matcher to optimize middleware execution
export const config = {
  matcher: [
    "/login",
    "/signup/:path*",
    "/dashboard/:path*",
    "/candidate/:path*",
    "/interview/:path*",
  ],
};
