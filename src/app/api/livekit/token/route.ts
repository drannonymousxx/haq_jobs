import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json({ error: "Missing interviewId" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create Supabase client using the user's specific JWT
    const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // 1. Get authenticated user
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    // 2. Fetch interview details (Respects RLS: user must be recruiter or candidate linked to the interview)
    const { data: interview, error: intError } = await supabaseServer
      .from("interviews")
      .select(`
        id,
        status,
        candidate_id,
        recruiter_id,
        scheduled_at
      `)
      .eq("id", interviewId)
      .single();

    if (intError || !interview) {
      return NextResponse.json({ error: "Access Denied: You are not a participant in this interview" }, { status: 403 });
    }

    // Check if the user is authorized to join this interview room
    const isCandidate = user.id === interview.candidate_id;
    const isRecruiter = user.id === interview.recruiter_id;

    if (!isCandidate && !isRecruiter) {
      return NextResponse.json({ error: "Access Denied: Unauthorized participant" }, { status: 403 });
    }

    // 3. Prevent rejoining completed rooms or joining too early
    if (interview.status === "completed") {
      return NextResponse.json({ error: "Access Denied: This interview session has already ended" }, { status: 403 });
    }

    const scheduledTime = new Date(interview.scheduled_at).getTime();
    const now = Date.now();
    const minsUntilStart = (scheduledTime - now) / (1000 * 60);

    if (minsUntilStart > 15) {
      return NextResponse.json({ 
        error: `Access Denied: This interview is scheduled for ${new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. You can only join up to 15 minutes before the start time.` 
      }, { status: 403 });
    }

    // Check if configuration is missing
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: "LiveKit server credentials missing" }, { status: 500 });
    }

    // Fetch user full name for LiveKit label
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const participantName = profile?.full_name || user.email || "Anonymous User";
    const roomName = `interview-${interview.id}`;

    // Create secure room token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Temporarily drift Date by 2 minutes in the past to prevent clock drift issues
    // on LiveKit cloud where a token is rejected if the local system clock is ahead of LiveKit.
    const OriginalDate = global.Date;
    const offset = 2 * 60 * 1000;
    class DriftedDate extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(OriginalDate.now() - offset);
        } else {
          // @ts-ignore
          super(...args);
        }
      }
    }

    let tokenJwt;
    try {
      global.Date = DriftedDate as any;
      tokenJwt = await at.toJwt();
    } finally {
      global.Date = OriginalDate;
    }

    return NextResponse.json({ token: tokenJwt, url: livekitUrl });
  } catch (error: any) {
    console.error("LiveKit token API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
