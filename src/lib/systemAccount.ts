import { supabase } from "./supabase";

export const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

interface WorkflowEventParams {
  userId: string;          // The user receiving the alert (candidate or recruiter)
  title: string;           // Notification header/title
  content: string;         // Plaintext body details
  type: "shortlist" | "interview" | "offer" | "rejection" | "applied" | "cancelled"; 
  referenceId?: string;    // e.g. application_id or job_id
  referenceType?: string;  // e.g. 'job_applications'
  attachmentUrl?: string;  // e.g. offer letters, resumes
}

/**
 * Triggers a recruiter-applicant workflow event by invoking the database's 
 * trigger_system_event RPC function in a secure, production-compliant manner.
 */
export async function triggerWorkflowEvent({
  userId,
  title,
  content,
  type,
  referenceId,
  referenceType,
  attachmentUrl
}: WorkflowEventParams) {
  try {
    const { error } = await supabase.rpc("trigger_system_event", {
      p_user_id: userId,
      p_title: title,
      p_content: content,
      p_type: type,
      p_reference_id: referenceId || null,
      p_reference_type: referenceType || null,
      p_attachment_url: attachmentUrl || null
    });

    if (error) {
      console.error("Failed to trigger workflow system event via RPC:", error.message);
    }
  } catch (err) {
    console.error("triggerWorkflowEvent failure:", err);
  }
}
