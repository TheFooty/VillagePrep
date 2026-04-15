import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_ROUTES = ['/api/auth', '/api/classes', '/api/youtube'];
const PROTECTED_API_ROUTES = ['/api/study-sets', '/api/study-set-files', '/api/study-set-content', '/api/folders', '/api/enroll', '/api/notes', '/api/user-data', '/api/quiz-results', '/api/progress'];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  const isPublic = PUBLIC_API_ROUTES.some(route => path.startsWith(route));
  if (isPublic) {
    return NextResponse.next();
  }
  
  const isProtected = PROTECTED_API_ROUTES.some(route => path.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }
  
  const sessionToken = req.cookies.get('vpSession')?.value;
  const pendingEmail = req.cookies.get('vpPendingEmail')?.value;
  
  if (!sessionToken && !pendingEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};