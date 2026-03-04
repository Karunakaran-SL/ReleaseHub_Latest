
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongodb';
import { createSession } from '@/lib/session';
import type { User } from '@/lib/definitions';
import { normalizeRoles } from '@/lib/role-utils';

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

    // User does not exist → reject (users must be created by an admin)
    if (!user) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    // User exists. Check password.
    if (typeof user.password !== 'string') {
      // Handle cases where password is not a string (e.g., null, undefined)
      return NextResponse.json({ message: 'Invalid credentials format.' }, { status: 401 });
    }

    const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (isPasswordHashed) {
      // Case 2: User exists and password is a valid hash. Compare it.
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        const rolesToPass = normalizeRoles(user.roles || (user as any).role);
        await createSession(user._id.toString(), user.username, rolesToPass);
        return NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
      }
    } else {
      // Case 3: User exists, but password is a plaintext string (legacy).
      if (user.password === password) {
        // Hash the plaintext password and update it in the DB.
        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        const rolesToPass = normalizeRoles(user.roles || (user as any).role);
        await createSession(user._id.toString(), user.username, rolesToPass);

        return NextResponse.json({ message: 'Password updated and logged in successfully' }, { status: 200 });
      }
    }

    // If we've reached here, it means the password comparison failed.
    return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
