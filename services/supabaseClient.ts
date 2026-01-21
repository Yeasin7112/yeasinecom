
import { createClient } from '@supabase/supabase-js';

/**
 * Enhanced function to get environment variables.
 * It checks multiple possible locations where Vercel/Vite/ESM.sh might hide them.
 */
const findEnvValue = (key: string): string => {
  if (typeof window === 'undefined') return '';

  const configKey = `__CONFIG_${key}`;
  const viteKey = `VITE_${key}`;

  // 1. Try global process.env (Standard)
  const processEnv = (window as any).process?.env || (typeof process !== 'undefined' ? process.env : {});
  if (processEnv[key]) return processEnv[key];
  if (processEnv[viteKey]) return processEnv[viteKey];

  // 2. Try localStorage (Manual fallback)
  const saved = localStorage.getItem(configKey);
  if (saved) return saved;

  return '';
};

const supabaseUrl = findEnvValue('SUPABASE_URL');
const supabaseAnonKey = findEnvValue('SUPABASE_ANON_KEY');

// Initialize only if keys exist
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Diagnostic logs for the developer (Press F12 to see)
 */
console.log("--- Supabase Diagnostic ---");
console.log("URL Found:", supabaseUrl ? "✅ Yes" : "❌ No");
console.log("Key Found:", supabaseAnonKey ? "✅ Yes" : "❌ No");
if (!supabase) console.warn("App is in SETUP MODE. Please provide credentials.");

/**
 * Actions
 */
export const saveManualConfig = (url: string, key: string) => {
  localStorage.setItem('__CONFIG_SUPABASE_URL', url.trim());
  localStorage.setItem('__CONFIG_SUPABASE_ANON_KEY', key.trim());
  window.location.reload();
};

export const clearConfig = () => {
  localStorage.removeItem('__CONFIG_SUPABASE_URL');
  localStorage.removeItem('__CONFIG_SUPABASE_ANON_KEY');
  window.location.reload();
};
