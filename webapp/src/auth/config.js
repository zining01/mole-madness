// Reviewer sign-in works when the site is built with these two settings
// (webapp/.env.local locally, Vercel → Settings → Environment Variables when
// deployed). Without them everyone is a guest, and "Report a problem" falls
// back to copy-to-clipboard.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY; // the publishable (anon) key, never service_role
export const accountsEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);
