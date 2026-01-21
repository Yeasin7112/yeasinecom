
import { createClient } from '@supabase/supabase-js';

/**
 * Vercel environment variables are injected at build time.
 * For browser-side access in plain ESM/React setups, we ensure we handle 
 * missing variables gracefully.
 */

const getEnv = (key: string): string => {
  try {
    // Attempt to get from process.env (common in build tools)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    // Fallback or check window for injected configs if any
    return '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("⚠️ Supabase Configuration Missing:");
  console.info("Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in Vercel Environment Variables.");
  console.info("Go to: Vercel Project > Settings > Environment Variables");
} else {
  console.log("✅ Supabase client initialized successfully.");
}
