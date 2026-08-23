import { createClient } from '@supabase/supabase-js';

// Production: these values should be supplied by Vercel Environment Variables.
// The fallback uses only the Supabase publishable key (not service_role) so the
// application can still build if Vercel has not yet received the variables.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fepxwhtqxwtzzlkegsee.supabase.co';

const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable__sU66St4OWzyl3VnKiJPYQ_KPp2Z-J7';

export const supabase = createClient(url, key);
