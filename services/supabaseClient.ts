
import { createClient } from '@supabase/supabase-js';

/**
 * Robust Environment Variable Fetching
 * Prioritizes: 
 * 1. window.APP_CONFIG (Set in index.html)
 * 2. localStorage (Manual setup fallback)
 * 3. process.env (Vercel/Build tools)
 */
const getEnv = (key: string): string => {
  if (typeof window === 'undefined') return '';

  // 1. Check Global Config (Best for cPanel/Hosting)
  const config = (window as any).APP_CONFIG;
  if (config && config[key]) return config[key];

  // 2. Check localStorage (Manual Input fallback)
  const saved = localStorage.getItem(`__CONFIG_${key}`);
  if (saved) return saved;

  // 3. Check process.env (Standard build systems)
  const processEnv = (typeof process !== 'undefined') ? process.env : {};
  const viteKey = `VITE_${key}`;
  if ((processEnv as any)[key]) return (processEnv as any)[key];
  if ((processEnv as any)[viteKey]) return (processEnv as any)[viteKey];

  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Create the client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Diagnostics
 */
if (!supabase) {
  console.log("❌ Supabase connection failed. Missing URL or Key.");
} else {
  console.log("✅ Supabase successfully connected.");
}

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
