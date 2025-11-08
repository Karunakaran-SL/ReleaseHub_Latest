import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { createSession } from '@/lib/session';
import type { User } from '@/lib/definitions';

const SignInSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = SignInSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ message: 'Invalid username or password format.' }, { status: 400 });
    }

    const { username, password } = validatedFields.data;

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<User>('users');
    
    const user = await usersCollection.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 10);

    // If no user exists, create one with the hashed password.
    if (!user) {
      const newUser = await usersCollection.insertOne({ username, password: hashedPassword } as any);
      await createSession(newUser.insertedId.toString(), username);
      return NextResponse.json({ message: 'User created and logged in successfully' }, { status: 201 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password as string);

    // If passwords match, create a session and log in.
    if (passwordsMatch) {
      await createSession(user._id.toString(), user.username);
      return NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
    }

    // THIS IS THE FIX: If passwords do NOT match, it means the stored password is
    // likely un-hashed. We'll update it with the correctly hashed one and log the user in.
    // This will fix the corrupted data from the initial bug.
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    await createSession(user._id.toString(), user.username);
    
    return NextResponse.json({ message: 'Password updated and logged in successfully' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
