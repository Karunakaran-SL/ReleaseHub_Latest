import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

const publicRoutes = ['/login'];
const protectedRoutes = ['/', '/products', '/api-docs', '/audits', '/cmdb', '/dependency-metrics', '/fleet-management', '/license', '/platform-engineering', '/release-management', '/settings', '/specifications', '/workflows'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  let session;
  try {
    session = await decrypt(sessionCookie);
  } catch (error) {
    // Invalid session cookie, treat as no session
    session = null;
  }

  // Redirect to dashboard if a logged-in user tries to access the login page
  if (pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to public routes for unauthenticated users
  if (publicRoutes.some(route => pathname.startsWith(route)) && !session) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!pathname.startsWith('/login') && !session) {
      return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
