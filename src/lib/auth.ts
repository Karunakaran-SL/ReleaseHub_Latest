'use server';

import { redirect } from 'next/navigation';
import { deleteSession, decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export async function signOut() {
  await deleteSession();
  redirect('/login');
}

export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  const decryptedSession = await decrypt(session);
  if (!decryptedSession) return null;

  const rolesFromSession = decryptedSession.roles ||
    (decryptedSession.role ? [decryptedSession.role] : ['viewer']);

  return {
    _id: decryptedSession.userId,
    username: decryptedSession.username,
    roles: rolesFromSession as string[],
    role: rolesFromSession[0] as string // Backward compatibility
  };
}
