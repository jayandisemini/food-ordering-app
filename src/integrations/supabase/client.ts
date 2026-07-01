import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 🚀 සෘජුවම ඔයාගේ සැබෑ Supabase Cloud Project එකට සම්බන්ධ කිරීම (Production Ready):
const SUPABASE_URL = "https://jkuqaajnlftacqqanhep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4V8vSW6_K8okyM-VWrDXww_kxI9JzjV";

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