import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── Runtime validation ─────────────────────────────────────────────────────
// Fail loudly in development; log a clear error in production rather than
// silently connecting to a placeholder project.

function assertValidConfig(url: string | undefined, key: string | undefined) {
  if (!url || url.includes("placeholder") || url.includes("example")) {
    const msg =
      "[HAQJobs] Invalid Supabase configuration. " +
      "NEXT_PUBLIC_SUPABASE_URL is missing or contains a placeholder value. " +
      "Set the correct value in .env.local (dev) or your deployment environment variables (prod).";
    if (process.env.NODE_ENV === "development") {
      throw new Error(msg);
    } else {
      console.error(msg);
    }
  }

  if (!key || key === "placeholder-key" || key.includes("placeholder")) {
    const msg =
      "[HAQJobs] Invalid Supabase configuration. " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or contains a placeholder value. " +
      "Set the correct value in .env.local (dev) or your deployment environment variables (prod).";
    if (process.env.NODE_ENV === "development") {
      throw new Error(msg);
    } else {
      console.error(msg);
    }
  }
}

assertValidConfig(supabaseUrl, supabaseAnonKey);

// Safe to cast after validation above — we never fall back to a placeholder.
export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
);