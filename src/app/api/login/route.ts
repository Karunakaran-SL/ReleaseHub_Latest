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

    // If no user exists, create one with the hashed password.
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await usersCollection.insertOne({ username, password: hashedPassword });
      await createSession(newUser.insertedId.toString(), username);
      return NextResponse.json({ message: 'User created and logged in successfully' }, { status: 201 });
    }

    // If user exists, check password
    // Case 1: Password is not a string (e.g. not hashed yet) or is missing.
    // In this case, we'll hash the new password and update the user.
    if (typeof user.password !== 'string') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        await createSession(user._id.toString(), user.username);
        
        return NextResponse.json({ message: 'Password updated and logged in successfully' }, { status: 200 });
    }

    // Case 2: Password is a string (presumably hashed). Compare it.
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (passwordsMatch) {
      await createSession(user._id.toString(), user.username);
      return NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
    }
    
    // If passwords do not match, return an error.
    return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
