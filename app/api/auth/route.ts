import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/auth';
import crypto from 'crypto';

type Role = 'teacher' | 'student';

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';
const CODE_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS_PER_CODE = 5;
const MAX_CODES_PER_HOUR = 20;

function detectRole(email: string): Role {
  const schoolDomains = ['@thevillageschool.com', '@villageprep.com', '@school.edu'];
  return schoolDomains.some(domain => email.endsWith(domain)) ? 'teacher' : 'student';
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string, email: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET)
    .update(`${email}:${code}`)
    .digest('hex');
}

async function sendLoginCode(email: string, code: string) {
  const fromAddress = process.env.AUTH_EMAIL_FROM || 'auth@villageprep.net';

  if (!process.env.RESEND_API_KEY) {
    console.log(`[dev auth] Code for ${email}: ${code}`);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Your VillagePrep login code',
      html: `<p>Your VillagePrep login code is <strong>${code}</strong>.</p><p>This code expires in ${CODE_EXPIRY_MINUTES} minutes.</p>`
    });
  } catch (error) {
    console.error('Resend send failed:', error);
    throw error;
  }
}

async function storeAuthCode(supabase: any, email: string, code: string): Promise<{ success: boolean; remaining: number }> {
  const hashed = hashCode(code, email);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // Clean up expired codes first
  await supabase
    .from('auth_codes')
    .delete()
    .lt('expires_at', new Date().toISOString());

  // Count codes sent in last 15 minutes (not hour) - more lenient
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('auth_codes')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', fifteenMinutesAgo);

  if (error) {
    console.error('[storeAuthCode] count query error:', error);
    throw new Error('Database error checking rate limit');
  }

  console.log(`[storeAuthCode] email=${email}, count=${count}`);

  const recentCount = count || 0;
  if (recentCount >= 5) { // 5 codes per 15 minutes
    return { success: false, remaining: 0 };
  }

  const { error: insertError } = await supabase
    .from('auth_codes')
    .insert([{ email, code_hash: hashed, expires_at: expiresAt, attempts: 0 }]);

  console.log(`[storeAuthCode] insert result: error=${JSON.stringify(insertError)}`);

  if (insertError) {
    console.error('[storeAuthCode] insert error:', insertError);
    throw new Error('Database error storing auth code');
  }

  return { success: true, remaining: 5 - recentCount - 1 };
}

async function verifyCode(supabase: any, email: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const hashed = hashCode(code, email);

  const { data: codes, error } = await supabase
    .from('auth_codes')
    .select('*')
    .eq('email', email)
    .eq('code_hash', hashed)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !codes || codes.length === 0) {
    return { valid: false, error: 'Invalid or expired code' };
  }

  const authCode = codes[0];
  if (authCode.attempts >= MAX_ATTEMPTS_PER_CODE) {
    return { valid: false, error: 'Too many attempts. Request a new code.' };
  }

  await supabase
    .from('auth_codes')
    .update({ attempts: authCode.attempts + 1 })
    .eq('id', authCode.id);

  return { valid: true };
}

function createSessionToken(): string {
  return crypto.randomUUID();
}

async function createSession(supabase: any, userId: string, email: string): Promise<string> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from('sessions')
    .insert([{ user_id: userId, session_token: token, expires_at: expiresAt }]);

  return token;
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const { email: rawEmail } = await req.json();
    const email = rawEmail?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const code = generateCode();
    const result = await storeAuthCode(supabase, email, code);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many codes sent. Please wait before requesting another.' },
        { status: 429 }
      );
    }

    await sendLoginCode(email, code);
    const role = detectRole(email);

    const response = NextResponse.json({
      role,
      message: 'Code sent',
      remainingCodes: result.remaining
    });

    response.cookies.set('vpPendingEmail', email, {
      maxAge: CODE_EXPIRY_MINUTES * 60,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (err) {
    console.error('Auth POST error', err);
    return NextResponse.json({ error: 'Failed to send login code' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const { email: rawEmail, code: rawCode } = await req.json();
    const email = rawEmail?.trim().toLowerCase();
    const code = rawCode?.trim();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const pendingEmail = req.cookies.get('vpPendingEmail')?.value;
    if (!pendingEmail || pendingEmail !== email) {
      return NextResponse.json({ error: 'No pending login. Request a new code.' }, { status: 400 });
    }

    const verifyResult = await verifyCode(supabase, email, code);
    if (!verifyResult.valid) {
      return NextResponse.json({ error: verifyResult.error }, { status: 400 });
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .limit(1);

    let userData = profiles?.[0];

    if (!userData) {
      const role = detectRole(email);
      const id = crypto.randomUUID();
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{ id, email, role }])
        .select()
        .single();

      if (error) {
        console.error('Failed to create profile:', error);
      } else {
        userData = newProfile;
      }
    }

    const sessionToken = await createSession(supabase, userData?.id || email, email);

    const response = NextResponse.json({
      email,
      role: userData?.role || detectRole(email),
      userId: userData?.id
    });

    response.cookies.set('vpSession', sessionToken, {
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    });

    response.cookies.delete('vpPendingEmail');

    return response;
  } catch (err) {
    console.error('Auth PUT error', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (email) {
      await supabase
        .from('auth_codes')
        .delete()
        .eq('email', email);
      const response = NextResponse.json({ message: 'Auth codes cleared for email' });
      return response;
    }

    const sessionToken = req.cookies.get('vpSession')?.value;

    if (sessionToken) {
      await supabase
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken);
    }

    const response = NextResponse.json({ message: 'Logged out' });
    response.cookies.delete('vpSession');
    response.cookies.delete('vpPendingEmail');

    return response;
  } catch (err) {
    console.error('Auth DELETE error', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const sessionToken = req.cookies.get('vpSession')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*, profiles(email, role)')
      .eq('session_token', sessionToken)
      .gte('expires_at', new Date().toISOString())
      .limit(1);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ authenticated: false });
    }

    const session = sessions[0];
    return NextResponse.json({
      authenticated: true,
      email: session.profiles?.email,
      role: session.profiles?.role
    });
  } catch (err) {
    console.error('Auth GET error', err);
    return NextResponse.json({ authenticated: false });
  }
}