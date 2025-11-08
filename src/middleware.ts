import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = cookies().get('session')?.value;
  const session = await decrypt(sessionCookie);

  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
