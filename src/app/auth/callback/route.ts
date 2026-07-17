import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { convertRecruiterLead } from "@/lib/leadService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const roleParam = searchParams.get("role") || "candidate";
  const targetRole = roleParam === "recruiter" ? "recruiter" : "candidate";

  const getRedirectPath = (role: string) => role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";

  if (!code) {
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
      console.error("[AuthCallback] Session exchange error:", sessionError?.message);
      return NextResponse.redirect(new URL("/login?error=auth_exchange_failed", request.url));
    }

    const user = session.user;

    // Check if profile exists
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let resolvedRole = targetRole;

    if (!profile) {
      // First-time OAuth signup: Create profile record
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Google User";
      
      const { error: insertError } = await supabaseServer
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

      if (insertError) {
        console.error("[AuthCallback] Profile insert error:", insertError.message);
      }

      // Sync role in user metadata on auth server
      try {
        await supabaseServer.auth.updateUser({
          data: { role: targetRole }
        });
      } catch (metaErr) {
        console.error("[AuthCallback] Failed to update auth metadata:", metaErr);
      }

      // Link existing lead if recruiter
      if (targetRole === "recruiter" && user.email) {
        try {
          await convertRecruiterLead(user.email, user.id);
        } catch (leadErr) {
          console.error("[AuthCallback] Failed to link lead:", leadErr);
        }
      }
    } else {
      // Profile exists: update the role to targetRole to align with their click intent
      resolvedRole = targetRole;

      if (profile.role !== targetRole) {
        const { error: updateDbError } = await supabaseServer
          .from("profiles")
          .update({ role: targetRole })
          .eq("id", user.id);

        if (updateDbError) {
          console.error("[AuthCallback] Profile role update error:", updateDbError.message);
        }

        // Link existing lead if changed to recruiter
        if (targetRole === "recruiter" && user.email) {
          try {
            await convertRecruiterLead(user.email, user.id);
          } catch (leadErr) {
            console.error("[AuthCallback] Failed to link lead during role update:", leadErr);
          }
        }
      }

      // Sync auth metadata if missing/mismatched the role
      if (!user.user_metadata?.role || user.user_metadata.role !== targetRole) {
        try {
          await supabaseServer.auth.updateUser({
            data: { role: targetRole }
          });
        } catch (metaErr) {
          console.error("[AuthCallback] Failed to sync auth metadata:", metaErr);
        }
      }
    }

    // Refresh the session to retrieve the brand-new access token with the updated metadata
    let finalSession = session;
    try {
      const { data: refreshData, error: refreshError } = await supabaseServer.auth.refreshSession({
        refresh_token: session.refresh_token,
      });
      if (refreshData?.session && !refreshError) {
        finalSession = refreshData.session;
      }
    } catch (refreshErr) {
      console.error("[AuthCallback] Session refresh for metadata update failed:", refreshErr);
    }

    const cookieStore = await cookies();
    const maxAge = finalSession.expires_in || 3600;

    cookieStore.set("sb-access-token", finalSession.access_token, {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: true,
    });

    if (finalSession.refresh_token) {
      cookieStore.set("sb-refresh-token", finalSession.refresh_token, {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
        secure: true,
      });
    }

    // Redirect directly to the correct dashboard path
    return NextResponse.redirect(new URL(getRedirectPath(resolvedRole), request.url));
  } catch (err: any) {
    console.error("[AuthCallback] Unexpected error:", err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
