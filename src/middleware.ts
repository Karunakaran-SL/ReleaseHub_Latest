import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

const publicRoutes = ['/login', '/setup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  let session;
  try {
    session = await decrypt(sessionCookie);
  } catch {
    session = null;
  }

  // /setup is always accessible; also redirect to home if already logged in
  if (pathname.startsWith('/setup')) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Redirect logged-in users away from the login page
  if (pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow unauthenticated access to other public routes
  if (publicRoutes.some(route => pathname.startsWith(route)) && !session) {
    return NextResponse.next();
  }

  // All other routes require a valid session
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
