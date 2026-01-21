
import { createClient } from '@supabase/supabase-js';

/**
 * Note for Vercel: Standard build tools replace 'process.env.VAR_NAME' 
 * with the actual value during build time. Using dynamic keys like 
 * process.env[key] often fails in these environments.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Create the client only if both credentials exist
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Console logs to help debug in the browser console (F12)
if (!supabase) {
  console.warn("⚠️ Supabase Credentials Missing.");
  console.info("Static check failed for process.env.SUPABASE_URL or process.env.SUPABASE_ANON_KEY.");
} else {
  console.log("✅ Supabase client initialized successfully.");
}
