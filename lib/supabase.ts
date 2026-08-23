import { createClient } from '@supabase/supabase-js';

// Vercel should provide these as Environment Variables.
// The anon/publishable key is intentionally safe for browser use; never use service_role here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Do not throw while Next.js is collecting/building pages when Vercel env vars
// have not yet been configured. Server/client code will show a clear error at runtime.
export function getSupabaseClient() {
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in Vercel.'
    );
  }
  return createClient(url, key);
}

// Backward-compatible client export for existing client components.
// It is created only when the module is actually evaluated at runtime.
export const supabase = {
  from(table: string) {
    return getSupabaseClient().from(table);
  },
  auth: getSupabaseClient().auth,
};
