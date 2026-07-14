import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateICSDataURI } from "@/lib/ics";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Bypasses RLS to query and notify users in background
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const now = new Date();
    
    // 1. Fetch upcoming accepted interviews
    const { data: interviews, error: fetchErr } = await supabaseAdmin
      .from("interviews")
      .select(`
        *,
        job:job_id (
          title,
          firm_name
        ),
        candidate:candidate_id (
          full_name,
          email
        ),
        recruiter:recruiter_id (
          full_name,
          email
        )
      `)
      .in("status", ["accepted", "pending"]);

    if (fetchErr) throw fetchErr;
    if (!interviews || interviews.length === 0) {
      return NextResponse.json({ message: "No active interviews found." });
    }

    let notificationsSent = 0;

    for (const interview of interviews) {
      const scheduledTime = new Date(interview.scheduled_at).getTime();
      const diffMs = scheduledTime - now.getTime();
      const diffMins = diffMs / (1000 * 60);

      // Check if scheduled time is in the past
      if (diffMs < 0) continue;

      let reminderType: "24h" | "1h" | "15m" | null = null;

      // Determine which reminder should be sent
      if (diffMins <= 15 && !interview.reminder_15m_sent) {
        reminderType = "15m";
      } else if (diffMins <= 60 && !interview.reminder_1h_sent && !interview.reminder_15m_sent) {
        reminderType = "1h";
      } else if (diffMins <= 1440 && !interview.reminder_24h_sent && !interview.reminder_1h_sent && !interview.reminder_15m_sent) {
        reminderType = "24h";
      }

      if (reminderType) {
        const timeLabel = 
          reminderType === "15m" ? "15 minutes" : 
          reminderType === "1h" ? "1 hour" : "24 hours";

        const candidateName = interview.candidate?.full_name || "Candidate";
        const recruiterName = interview.recruiter?.full_name || "Recruiter";
        const jobTitle = interview.job?.title || "Legal Opening";
        const meetingLink = interview.meeting_link;

        // Generate ICS Calendar Data URI to include in the reminders
        const icsUrl = generateICSDataURI({
          id: interview.id,
          title: `${interview.round || "Legal Interview"} - ${interview.title}`,
          scheduledAt: interview.scheduled_at,
          duration: interview.duration,
          type: interview.type,
          meetingLink: interview.type === "online" && meetingLink ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${meetingLink}` : undefined,
          location: interview.type === "offline" ? interview.location : undefined,
          notes: interview.notes,
          recruiterName,
          recruiterEmail: interview.recruiter?.email || "",
          candidateName,
          candidateEmail: interview.candidate?.email || ""
        });

        // Notify Candidate
        await supabaseAdmin.rpc("trigger_system_event", {
          p_user_id: interview.candidate_id,
          p_title: `Reminder: Interview in ${timeLabel}`,
          p_content: `Friendly reminder: Your ${interview.round || "Legal Interview"} for "${jobTitle}" with "${interview.job?.firm_name || "Hiring Firm"}" starts in ${timeLabel}.\n\nTime: ${new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nLink/Location: ${interview.type === "online" ? meetingLink : interview.location || "N/A"}\n\nICS calendar invite attached.`,
          p_type: "interview",
          p_reference_id: interview.application_id,
          p_reference_type: "job_applications",
          p_attachment_url: icsUrl
        });

        // Notify Recruiter
        await supabaseAdmin.rpc("trigger_system_event", {
          p_user_id: interview.recruiter_id,
          p_title: `Reminder: Interview with ${candidateName} in ${timeLabel}`,
          p_content: `Friendly reminder: The ${interview.round || "Legal Round"} with "${candidateName}" for "${jobTitle}" starts in ${timeLabel}.\n\nTime: ${new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nLink/Location: ${interview.type === "online" ? meetingLink : interview.location || "N/A"}\n\nICS calendar invite attached.`,
          p_type: "interview",
          p_reference_id: interview.application_id,
          p_reference_type: "job_applications",
          p_attachment_url: icsUrl
        });

        // Update database sent flags
        const updatePayload: any = {};
        if (reminderType === "24h") {
          updatePayload.reminder_24h_sent = true;
        } else if (reminderType === "1h") {
          updatePayload.reminder_1h_sent = true;
        } else if (reminderType === "15m") {
          updatePayload.reminder_15m_sent = true;
        }

        await supabaseAdmin
          .from("interviews")
          .update(updatePayload)
          .eq("id", interview.id);

        notificationsSent++;
      }
    }

    return NextResponse.json({ message: "Reminder processing completed.", notificationsSent });
  } catch (error: any) {
    console.error("Reminders CRON error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
