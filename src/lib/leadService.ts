import { supabase } from "./supabase";

/**
 * Checks for existing, unconverted recruiter leads associated with the provided email.
 * If found, updates the lead status to CONVERTED, associates the profile ID, and saves timestamps.
 * 
 * @param email The recruiter's work email address
 * @param profileId The newly created profile ID of the recruiter user
 * @returns Promise<boolean> True if a matching lead was found and converted, false otherwise
 */
export async function convertRecruiterLead(email: string, profileId: string): Promise<boolean> {
  if (!email || !profileId) return false;
  
  try {
    const { data: success, error } = await supabase.rpc("convert_recruiter_lead", {
      p_email: email.trim().toLowerCase(),
      p_profile_id: profileId,
    });

    if (error) {
      console.error("Error during lead conversion:", error.message);
      return false;
    }

    return !!success;
  } catch (err) {
    console.error("Failed to run lead conversion service:", err);
    return false;
  }
}
