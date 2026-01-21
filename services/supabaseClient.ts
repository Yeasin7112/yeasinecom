
import { createClient } from '@supabase/supabase-js';

// Vercel sets these as environment variables during deployment
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Create the client only if credentials exist to avoid runtime crashes
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
