import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isConfigured = Boolean(url && key && !url.includes('YOUR-PROJECT'));

// Only the public (anon / publishable) key ever reaches the browser. Row Level Security in the
// database decides what that key can read or write.
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url as string, key as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export function db(): SupabaseClient {
  if (!supabase) throw new Error('The website is not connected to its database yet.');
  return supabase;
}
