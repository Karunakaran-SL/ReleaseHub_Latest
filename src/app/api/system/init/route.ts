import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongodb';

// GET /api/system/init — check if any users exist (is the system initialized?)
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const count = await db.collection('users').countDocuments();
        return NextResponse.json({ initialized: count > 0 });
    } catch {
        return NextResponse.json({ initialized: false });
    }
}

// POST /api/system/init — create the first admin account (only if no users exist)
export async function POST(req: Request) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const count = await db.collection('users').countDocuments();
        if (count > 0) {
            return NextResponse.json(
                { message: 'System already initialized. Please log in.' },
                { status: 409 }
            );
        }

        const { username, password } = await req.json();
        if (!username || !password) {
            return NextResponse.json({ message: 'username and password are required.' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();

        await db.collection('users').insertOne({
            username,
            password: hashedPassword,
            role: 'admin',
            email: '',
            createdAt: now,
            createdBy: 'system',
        });

        return NextResponse.json(
            { message: 'Admin account created successfully. Please log in.' },
            { status: 201 }
        );
    } catch (error) {
        console.error('[system/init] Error:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}
