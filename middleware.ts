import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_ROUTES = ['/api/auth', '/api/classes', '/api/youtube'];
const PROTECTED_API_ROUTES = ['/api/study-sets', '/api/study-set-files', '/api/study-set-content', '/api/folders', '/api/enroll', '/api/notes', '/api/user-data', '/api/quiz-results', '/api/progress'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (!path.startsWith('/api/')) {
    return response;
  }

  const origin = req.headers.get('origin');
  if (origin && process.env.NODE_ENV === 'production') {
    const allowedOrigins = [process.env.NEXTAUTH_URL].filter(Boolean);
    if (!allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const isPublic = PUBLIC_API_ROUTES.some(route => path.startsWith(route));
  if (isPublic) {
    return response;
  }

  const isProtected = PROTECTED_API_ROUTES.some(route => path.startsWith(route));
  if (!isProtected) {
    return response;
  }

  const sessionToken = req.cookies.get('vpSession')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isValidUUID(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};