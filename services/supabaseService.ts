
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const initSupabase = (url: string, anonKey: string) => {
  supabase = createClient(url, anonKey);
  return supabase;
};

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase has not been initialized.');
  }
  return supabase;
};

export const syncProfile = async (user: any) => {
  const client = getSupabase();
  try {
    const { error } = await client
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email,
        last_seen: new Date().toISOString()
      });
    return { error };
  } catch (e) {
    return { error: e };
  }
};

export const fetchUsers = async () => {
  const client = getSupabase();
  try {
    const { data, error } = await client
      .from('profiles')
      .select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: [], error: err };
  }
};

export const checkSession = async () => {
  const client = getSupabase();
  const { data: { session } } = await client.auth.getSession();
  return session;
};

export const signOut = async () => {
  const client = getSupabase();
  await client.auth.signOut();
};
