import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from './definitions';

// IMPORTANT: This secret should be a securely generated random string
// and stored in an environment variable. For demonstration purposes, it's
// hardcoded here.
const secretKey = process.env.SESSION_SECRET || 'a-super-secret-key-that-is-long-enough-for-hs256';
const encodedKey = new TextEncoder().encode(secretKey);
const aDayInSeconds = 24 * 60 * 60;

export async function createSession(userId: string, username: string, roles: string[] = ['viewer']) {
  const expiresAt = new Date(Date.now() + aDayInSeconds * 1000);
  const session = await encrypt({ userId, username, roles, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    // This will be triggered if the token is invalid or expired
    return null;
  }
}
