import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export type UserRole = 'teacher' | 'student';

export function detectRole(email: string): UserRole {
  const schoolDomains = ['@thevillageschool.com', '@villageprep.com', '@school.edu'];
  return schoolDomains.some(domain => email.endsWith(domain)) ? 'teacher' : 'student';
}