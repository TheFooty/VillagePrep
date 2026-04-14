import { NextRequest, NextResponse } from 'next/server';

type Role = 'teacher' | 'student';

function detectRole(email: string): Role {
  return email.endsWith('@thevillageschool.com') ? 'teacher' : 'student';
}

async function sendLoginCode(email: string, code: string) {
  const fromAddress = process.env.AUTH_EMAIL_FROM || 'auth@villageprep.net';
  const body = `<p>Your VillagePrep login code is <strong>${code}</strong>.</p><p>Use it to sign in.</p>`;

  // eslint-disable-next-line no-console
  console.log('[auth] sendLoginCode called', { email, code, fromAddress, hasApiKey: !!process.env.RESEND_API_KEY });

  if (!process.env.RESEND_API_KEY) {
    // No Resend API key configured; fall back to dev logging.
    // eslint-disable-next-line no-console
    console.warn('[dev auth] RESEND_API_KEY missing; falling back to console output.');
    // eslint-disable-next-line no-console
    console.log(`[dev auth] code for ${email}: ${code}`);
    return;
  }

  // Lazy require to avoid build-time issues
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // eslint-disable-next-line no-console
    console.log('[auth] Calling resend.emails.send...');
    const result = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Your VillagePrep login code',
      html: body,
    });
    // eslint-disable-next-line no-console
    console.log('[auth] Resend response:', result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[auth] Resend send failed:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();
    const email = rawEmail?.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await sendLoginCode(email, code);
    const role = detectRole(email);
    const response = NextResponse.json({ role });
    response.cookies.set('vpLoginEmail', email, {
      maxAge: 600,
      sameSite: 'strict',
      path: '/',
    });
    response.cookies.set('vpLoginCode', code, {
      maxAge: 600,
      sameSite: 'strict',
      path: '/',
    });
    return response;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth POST error', err);
    return NextResponse.json({ error: 'Unable to send login code' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email: rawEmail, code: rawCode } = await req.json();
    const email = rawEmail?.trim().toLowerCase();
    const code = rawCode?.trim();
    if (!email || !code) return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    const savedEmail = req.cookies.get('vpLoginEmail')?.value;
    const expected = req.cookies.get('vpLoginCode')?.value;
    // eslint-disable-next-line no-console
    console.log('[auth] Verify attempt', { email, receivedCode: code, expectedCode: expected, savedEmail });
    if (!expected || savedEmail !== email || expected !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }
    const role = detectRole(email);
    const response = NextResponse.json({ email, role });
    response.cookies.delete('vpLoginEmail');
    response.cookies.delete('vpLoginCode');
    return response;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth PUT error', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Auth API (dev)' });
}
