
import { createClient } from '@supabase/supabase-js';

/**
 * Get environment variables with multiple fallbacks.
 * Checks standard names, Vite-style, and localStorage.
 */
const getEnv = (key: string): string => {
  // 1. Try process.env (Static replacement by most builders)
  const fromProcess = (typeof process !== 'undefined' && process.env) ? (process.env[key] || (process.env as any)[`VITE_${key}`] || (process.env as any)[`REACT_APP_${key}`]) : undefined;
  if (fromProcess) return fromProcess;

  // 2. Try localStorage (for manual fallback setup)
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`__CONFIG_${key}`) || '';
  }

  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("⚠️ Supabase Credentials Missing.");
} else {
  console.log("✅ Supabase client initialized.");
}

/**
 * Helper to manually save config (used by the setup UI)
 */
export const saveManualConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('__CONFIG_SUPABASE_URL', url);
    localStorage.setItem('__CONFIG_SUPABASE_ANON_KEY', key);
    window.location.reload();
  }
};
