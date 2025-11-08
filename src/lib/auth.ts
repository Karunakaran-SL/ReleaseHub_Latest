'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { createSession, deleteSession, decrypt } from '@/lib/session';
import type { User } from '@/lib/definitions';

const SignInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type FormState = {
  errors?: {
    email?: string[];
    password?: string[];
    server?: string[];
  };
  message?: string;
} | undefined;


export async function signIn(prevState: FormState, formData: FormData) {
  const validatedFields = SignInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your email and password.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<User>('users');

    const userCount = await usersCollection.countDocuments();
    
    // If no users exist, create the first user
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await usersCollection.insertOne({ email, password: hashedPassword } as any);
      await createSession(newUser.insertedId.toString(), email);
      
      revalidatePath('/');
      redirect('/');
    }

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return { message: 'Invalid credentials. Please try again.' };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password as string);
    if (!passwordsMatch) {
      return { message: 'Invalid credentials. Please try again.' };
    }

    await createSession(user._id.toString(), user.email);

  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred. Please try again.' };
  }

  revalidatePath('/');
  redirect('/');
}

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
      email: decryptedSession.email
  };
}
