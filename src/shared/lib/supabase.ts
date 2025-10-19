import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const hasSupabase = Boolean(url && anonKey);

let client: SupabaseClient | null = null;
let warned = false;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!hasSupabase) {
    if (!warned) {
      console.warn('Supabase non configurato: verrà usato il fallback locale.');
      warned = true;
    }
    return null;
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return client;
};
