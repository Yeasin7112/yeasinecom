
import { createClient } from '@supabase/supabase-js';

// Access environment variables safely in a browser environment
const getEnv = (name: string) => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env[name] : '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Create the client only if credentials exist to avoid runtime crashes
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
