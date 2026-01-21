
import { createClient } from '@supabase/supabase-js';

// Vercel handles environment variables. We use them directly.
// If you are using a standard static deployment, ensure these are set in Vercel Dashboard.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Create the client. We'll handle the null case in the UI.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Debug log to help the developer (visible in browser console)
if (!supabase) {
  console.error("Supabase credentials missing. Check your Vercel Environment Variables.");
}
