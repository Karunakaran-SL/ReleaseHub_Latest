import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongodb';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { isAdminRole } from '@/lib/role-utils';

// GET /api/users — list all users (admin only)
export async function GET() {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();
    const users = await db.collection<User>('users')
        .find({}, { projection: { password: 0 } })
        .toArray();

    return NextResponse.json({ users });
}

// POST /api/users — create user (admin only)
export async function POST(req: Request) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { username, password, role, email } = await req.json();

    if (!username || !password || !role) {
        return NextResponse.json({ message: 'username, password, and role are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection<User>('users').findOne({ username });
    if (existing) {
        return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const result = await db.collection('users').insertOne({
        username,
        password: hashedPassword,
        role,
        email: email || '',
        createdAt: now,
        createdBy: currentUser.username,
    });

    return NextResponse.json({ message: 'User created.', userId: result.insertedId.toString() }, { status: 201 });
}
