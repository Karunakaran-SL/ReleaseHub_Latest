import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { isAdminRole } from '@/lib/role-utils';

// PUT /api/users/[id] — update user role or password
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { role, email, newPassword } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const updateFields: Record<string, any> = {};
    if (role) updateFields.role = role;
    if (email !== undefined) updateFields.email = email;
    if (newPassword) {
        updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    let objectId: ObjectId;
    try {
        objectId = new ObjectId(params.id);
    } catch {
        return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const result = await db.collection<User>('users').updateOne(
        { _id: objectId as any },
        { $set: updateFields }
    );

    if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated.' });
}

// DELETE /api/users/[id] — delete user (cannot delete yourself)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (currentUser._id === params.id) {
        return NextResponse.json({ message: 'You cannot delete your own account.' }, { status: 400 });
    }

    let objectId: ObjectId;
    try {
        objectId = new ObjectId(params.id);
    } catch {
        return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection<User>('users').deleteOne({ _id: objectId as any });

    if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted.' });
}
