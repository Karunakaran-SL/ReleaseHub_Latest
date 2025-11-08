import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const publicRoutes = ['/login'];
const protectedRoutes = ['/', '/products', '/api-docs'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = cookies().get('session')?.value;

  let session;
  try {
    session = await decrypt(sessionCookie);
  } catch (error) {
    // Invalid session cookie, treat as no session
    session = null;
  }

  // Redirect to home if a logged-in user tries to access the login page
  if (pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to public routes for unauthenticated users
  if (publicRoutes.some(route => pathname.startsWith(route)) && !session) {
    return NextResponse.next();
  }

  // Protect routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
