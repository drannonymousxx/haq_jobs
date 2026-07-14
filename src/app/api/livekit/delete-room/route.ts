import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { interviewId } = await req.json();

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

    // 2. Fetch interview details (User must be the recruiter)
    const { data: interview, error: intError } = await supabaseServer
      .from("interviews")
      .select(`
        id,
        recruiter_id
      `)
      .eq("id", interviewId)
      .single();

    if (intError || !interview) {
      return NextResponse.json({ error: "Access Denied: Interview not found" }, { status: 404 });
    }

    // Verify user is recruiter for this interview
    if (user.id !== interview.recruiter_id) {
      return NextResponse.json({ error: "Access Denied: Only the recruiter can close the room" }, { status: 403 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: "LiveKit server credentials missing" }, { status: 500 });
    }

    const roomName = `interview-${interview.id}`;

    // Temporarily drift Date by 2 minutes in the past to prevent clock drift issues
    // on LiveKit cloud where requests are rejected if the local system clock is ahead of LiveKit.
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

    try {
      global.Date = DriftedDate as any;
      // Initialize Room Service Client and delete the active room
      const roomServiceClient = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
      await roomServiceClient.deleteRoom(roomName);
    } finally {
      global.Date = OriginalDate;
    }

    return NextResponse.json({ success: true, roomName });
  } catch (error: any) {
    console.error("LiveKit delete room API error:", error);
    // Ignore error if room is already deleted or doesn't exist on server
    if (error.message?.includes("room not found")) {
      return NextResponse.json({ success: true, warning: "Room was already inactive" });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
