/**
 * Maps raw database / Supabase / PostgREST / Storage errors to clean, user-friendly messages.
 * Never exposes raw SQL error messages (e.g. table not found, column not found, relation does not exist, etc.)
 */
export function mapSupabaseError(error: any, fallbackMessage: string = "Something went wrong. Please try again."): string {
  try {
    if (!error) return fallbackMessage;

    // 1. Safe logging
    try {
      console.error("Supabase API Error:", {
        code: typeof error === "object" ? error?.code : undefined,
        message: typeof error === "object" ? error?.message : String(error),
        details: typeof error === "object" ? error?.details : undefined,
        hint: typeof error === "object" ? error?.hint : undefined,
        status: typeof error === "object" ? error?.status : undefined,
      });
    } catch (logErr) {
      console.error("Failed to log Supabase API Error safely:", String(error));
    }

    // Convert error to a normalized string search target
    let searchString = "";
    let errorCode = "";
    let rawErrorMessage = "";

    if (typeof error === "string") {
      searchString = error.toLowerCase();
      rawErrorMessage = error;
    } else if (error instanceof Error) {
      searchString = (error.message || "").toLowerCase();
      rawErrorMessage = error.message;
      errorCode = (error as any).code ? String((error as any).code) : "";
    } else if (typeof error === "object" && error !== null) {
      errorCode = error.code ? String(error.code) : "";
      rawErrorMessage = error.message ? String(error.message) : "";
      const detailsStr = error.details ? String(error.details) : "";
      const hintStr = error.hint ? String(error.hint) : "";
      searchString = `${rawErrorMessage} ${detailsStr} ${hintStr}`.toLowerCase();
    } else {
      searchString = String(error).toLowerCase();
      rawErrorMessage = String(error);
    }

    // 1. Table not found errors
    if (errorCode === "42P01" || (searchString.includes("relation") && searchString.includes("does not exist"))) {
      return "Our services are currently undergoing maintenance. Please try again shortly. (Code: ERR_DB_TABLE_MISMATCH)";
    }

    // 2. Column not found errors
    if (errorCode === "42703" || (searchString.includes("column") && searchString.includes("does not exist"))) {
      return "Our services are currently undergoing maintenance. Please try again shortly. (Code: ERR_DB_COLUMN_MISMATCH)";
    }

    // 3. Storage bucket not found / invalid paths
    if (
      searchString.includes("bucket not found") || 
      searchString.includes("bucket_id") || 
      searchString.includes("storage") || 
      searchString.includes("bucket")
    ) {
      return "The storage service is temporarily unavailable. Please try again later. (Code: ERR_STORAGE_MISMATCH)";
    }

    // 4. Row level security / permission violations
    if (
      errorCode === "42501" || 
      searchString.includes("row-level security") || 
      searchString.includes("violates row-level security policy") ||
      searchString.includes("permission denied")
    ) {
      return "You do not have permission to perform this action.";
    }

    // 5. Unique constraint violations
    if (errorCode === "23505" || searchString.includes("duplicate key value") || searchString.includes("already exists")) {
      return "This record already exists.";
    }

    // 6. Foreign key violations
    if (errorCode === "23503" || searchString.includes("foreign key violation") || searchString.includes("is not present in table")) {
      return "This reference is invalid or no longer exists.";
    }

    // 7. Network / Connection errors
    if (searchString.includes("fetch") || searchString.includes("network") || searchString.includes("failed to fetch")) {
      return "Network error. Please check your internet connection and try again.";
    }

    // Mask raw queries or SQL syntax details
    const containsSqlKeywords = 
      searchString.includes("select") || 
      searchString.includes("insert") || 
      searchString.includes("update") || 
      searchString.includes("delete") || 
      searchString.includes("syntax error") ||
      searchString.includes("constraint");

    if (containsSqlKeywords) {
      return fallbackMessage;
    }

    return rawErrorMessage || fallbackMessage;
  } catch (outerErr) {
    console.error("Critical: mapSupabaseError crashed:", outerErr);
    return fallbackMessage || "Something went wrong. Please try again.";
  }
}
