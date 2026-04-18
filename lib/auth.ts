import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export type UserRole = 'teacher' | 'student';

export function detectRole(email: string): UserRole {
  const schoolDomains = ['@thevillageschool.com', '@villageprep.com', '@school.edu'];
  return schoolDomains.some(domain => email.endsWith(domain)) ? 'teacher' : 'student';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function validateSession(request: NextRequest): Promise<SessionUser | null> {
  try {
    const supabase = getSupabaseClient();
    const sessionToken = request.cookies.get('vpSession')?.value;

    if (!sessionToken) {
      return null;
    }

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*, profiles(id, email, role)')
      .eq('session_token', sessionToken)
      .gte('expires_at', new Date().toISOString())
      .limit(1);

    if (error || !sessions || sessions.length === 0) {
      return null;
    }

    const session = sessions[0];
    return {
      id: session.profiles?.id || session.user_id,
      email: session.profiles?.email,
      role: session.profiles?.role
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function validationErrorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverErrorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}