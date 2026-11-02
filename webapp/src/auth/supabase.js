// Supabase client and sign-in helpers. Only loaded once someone chooses to be a
// reviewer, so guests never download it.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Emails a one-time sign-in code. The database refuses (and no email goes out)
 * if the address isn't on the reviewer list; see hook_reviewers_only in
 * supabase/schema.sql.
 */
export async function sendEmailCode(email) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function verifyEmailCode(email, token) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}

export const signOut = () => supabase.auth.signOut();
