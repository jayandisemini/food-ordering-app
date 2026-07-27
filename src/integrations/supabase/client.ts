import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 🚀 සෘජුවම ඔයාගේ සැබෑ Supabase Cloud Project එකට සම්බන්ධ කිරීම (Production Ready):
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://utlwvuzuzjgarrjwcrck.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bHd2dXp1empnYXJyandjcmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTkyOTgsImV4cCI6MjA5NzE5NTI5OH0.-3yqgvvlu0Jg996xguFJfaUJZzY37DmcUnsowAnLbaw";

function createSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const message = "Missing critical Supabase connection parameters. Please check configuration.";
    console.error(`[Supabase Error]: ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// ප්‍රොජෙක්ට් එක පුරාම පාවිච්චි වන සැබෑ Supabase Client Instance එක:
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});