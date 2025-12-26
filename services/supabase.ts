import { createClient } from '@supabase/supabase-js';

// NOTE: In Vite, we use import.meta.env to access environment variables.
// We configured vite.config.ts to allow 'REACT_APP_' prefix.
// We use optional chaining (import.meta.env?.VAR) to handle cases where env might not be injected yet or incorrectly.

const supabaseUrl = import.meta.env?.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.REACT_APP_SUPABASE_ANON_KEY;

// Export a flag to check if we have valid configuration
export const isConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'undefined';

const url = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const key = isConfigured ? supabaseAnonKey : 'placeholder';

if (!isConfigured) {
  console.warn('Supabase Environment Variables (REACT_APP_SUPABASE_URL) are missing. App is running in offline/empty mode.');
}

// Ensure url and key are treated as strings
export const supabase = createClient(url as string, key as string);