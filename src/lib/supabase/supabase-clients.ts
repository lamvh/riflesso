import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Both clients are server-only and stateless: there is no signed-in user yet,
 * so no session is persisted or refreshed.
 */
const OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } };

function build(key: string | undefined): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  if (!url || !key) return null;
  return createClient(url, key, OPTIONS);
}

/** Anon key: RLS limits it to published content. Null when env is missing. */
export const publicReadClient = () => build(process.env.SUPABASE_ANON_KEY);

/** Service role key: bypasses RLS. Dashboard reads and publishing only. */
export const serviceRoleClient = () => build(process.env.SUPABASE_SERVICE_ROLE_KEY);
