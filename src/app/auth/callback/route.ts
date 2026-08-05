import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { convertRecruiterLead } from "@/lib/leadService";

const IS_DEV = process.env.NODE_ENV !== "production";

function logAuthCallback(...args: any[]) {
  if (IS_DEV) {
    console.log("[HAQAuth:OAuthCallback]", ...args);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const roleParam = searchParams.get("role") || "candidate";
  const targetRole = roleParam === "recruiter" ? "recruiter" : "candidate";

  const getRedirectPath = (role: string) => role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";

  logAuthCallback("Processing OAuth callback. Code present:", !!code, "Target role from URL:", targetRole);

  if (!code) {
    logAuthCallback("Missing OAuth code. Redirecting to /login.");
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabaseServer.auth.exchangeCodeForSession(code);

    if (sessionError || !session || !session.user) {
      console.error("[HAQAuth:OAuthCallback] Session exchange error:", sessionError?.message);
      return NextResponse.redirect(new URL("/login?error=auth_exchange_failed", request.url));
    }

    const user = session.user;
    logAuthCallback("Code exchanged successfully. User ID:", user.id, "Email:", user.email);

    // Create a server client with the user's session set so RLS and updateUser work correctly.
    // persistSession:false keeps credentials server-side only; setSession gives it the active tokens.
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    await authClient.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    // Check if profile exists using authenticated client
    const { data: profile } = await authClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let resolvedRole: "candidate" | "recruiter";

    if (profile) {
      // PRESERVE EXISTING ROLE ALWAYS! Never overwrite an existing user's database role.
      resolvedRole = profile.role === "recruiter" ? "recruiter" : "candidate";
      logAuthCallback("Existing profile found. Preserving authoritative DB role:", resolvedRole);

      // Sync user_metadata if out of sync with DB role
      if (user.user_metadata?.role !== resolvedRole) {
        try {
          await authClient.auth.updateUser({
            data: { role: resolvedRole }
          });
          logAuthCallback("Updated user_metadata.role to match DB role:", resolvedRole);
        } catch (metaErr) {
          console.error("[HAQAuth:OAuthCallback] Failed to sync user metadata:", metaErr);
        }
      }
    } else {
      // First-time OAuth signup: Create brand-new profile record
      resolvedRole = targetRole;
      logAuthCallback("No existing profile found. Creating new profile with role:", resolvedRole);

      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Google User";
      
      const { error: insertError } = await authClient
        .from("profiles")
        .insert({
          id: user.id,
          full_name: fullName,
          email: user.email || "",
          role: resolvedRole,
          company_name: user.user_metadata?.company_name || null,
          designation: user.user_metadata?.designation || null,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("[HAQAuth:OAuthCallback] Profile insert error:", insertError.message);
      }

      // Set role in user_metadata for fast JWT reads
      try {
        await authClient.auth.updateUser({
          data: { role: resolvedRole }
        });
      } catch (metaErr) {
        console.error("[HAQAuth:OAuthCallback] Failed to update auth metadata:", metaErr);
      }

      // Link existing lead if recruiter
      if (resolvedRole === "recruiter" && user.email) {
        try {
          await convertRecruiterLead(user.email, user.id);
        } catch (leadErr) {
          console.error("[HAQAuth:OAuthCallback] Failed to link lead:", leadErr);
        }
      }
    }

    // The session from exchangeCodeForSession is the freshest we have.
    // updateUser() above issued a new access token internally but we don't need to re-fetch;
    // the original session tokens are valid for setting cookies right now.
    const finalSession = session;

    const redirectPath = getRedirectPath(resolvedRole);
    logAuthCallback("Constructing redirect response to:", redirectPath);

    // Create the redirect response object
    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    const maxAge = finalSession.expires_in || 3600;

    // Attach cookies DIRECTLY to the returned NextResponse object to guarantee browser delivery
    response.cookies.set("sb-access-token", finalSession.access_token, {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: isProduction,
    });

    if (finalSession.refresh_token) {
      response.cookies.set("sb-refresh-token", finalSession.refresh_token, {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
        secure: isProduction,
      });
    }

    logAuthCallback("Set response cookies sb-access-token and sb-refresh-token. Returning redirect response.");
    return response;
  } catch (err: any) {
    console.error("[HAQAuth:OAuthCallback] Unexpected error:", err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
