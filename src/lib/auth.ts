'use server';

import { redirect } from 'next/navigation';
import { deleteSession, decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export async function signOut() {
  await deleteSession();
  redirect('/login');
}

export async function getUser() {
  const session = cookies().get('session')?.value;
  if (!session) return null;

  const decryptedSession = await decrypt(session);
  if (!decryptedSession) return null;

  return {
      id: decryptedSession.userId,
      username: decryptedSession.username
  };
}
