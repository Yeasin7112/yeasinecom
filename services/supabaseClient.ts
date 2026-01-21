
import { createClient } from '@supabase/supabase-js';

// Vercel বা লোকাল এনভায়রনমেন্ট থেকে ডাটা নেবে
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// চেক করা হচ্ছে কিগুলো আছে কি না
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
