import { createClient } from "@supabase/supabase-js"

/**
 * Server-side only Supabase client using the Service Role key.
 *
 * IMPORTANT:
 * - Never import this file from client components.
 * - Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: { persistSession: false },
  },
)
