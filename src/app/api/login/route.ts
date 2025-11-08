import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { createSession } from '@/lib/session';
import type { User } from '@/lib/definitions';

const SignInSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(8),
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
    
    const userCount = await usersCollection.countDocuments();
    
    // If no users exist, create the first user
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await usersCollection.insertOne({ username, password: hashedPassword } as any);
      await createSession(newUser.insertedId.toString(), username);
      return NextResponse.json({ message: 'User created and logged in successfully' }, { status: 201 });
    }
    
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password as string);
    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    await createSession(user._id.toString(), user.username);

    return NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
