import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DEFAULT_ROLES } from '@/lib/permissions';
import type { RoleRecord } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { isAdminRole } from '@/lib/role-utils';

// PUT /api/roles/[role] — update role permissions (admin only)
export async function PUT(req: Request, { params }: { params: { role: string } }) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { permissions, label, description } = await req.json();
    const { role } = params;

    const defaultRole = DEFAULT_ROLES[role];
    const now = new Date().toISOString();

    const client = await clientPromise;
    const db = client.db();

    await db.collection<RoleRecord>('roles').updateOne(
        { name: role },
        {
            $set: {
                name: role,
                label: label ?? defaultRole?.label ?? role,
                description: description ?? defaultRole?.description ?? '',
                permissions,
                isDefault: false,
                updatedAt: now,
            },
        },
        { upsert: true }
    );

    return NextResponse.json({ message: 'Role permissions updated.' });
}

// GET /api/roles/[role] — get single role
export async function GET(_req: Request, { params }: { params: { role: string } }) {
    const { role } = params;
    const client = await clientPromise;
    const db = client.db();

    const dbRole = await db.collection<RoleRecord>('roles').findOne({ name: role });
    const defaultRole = DEFAULT_ROLES[role];

    if (!dbRole && !defaultRole) {
        return NextResponse.json({ message: 'Role not found.' }, { status: 404 });
    }

    return NextResponse.json({
        name: role,
        label: dbRole?.label ?? defaultRole?.label,
        description: dbRole?.description ?? defaultRole?.description,
        permissions: dbRole?.permissions ?? (defaultRole?.permissions as Record<string, string[]>),
    });
}

// DELETE /api/roles/[role] — delete a custom role (admin only, cannot delete system roles)
export async function DELETE(_req: Request, { params }: { params: { role: string } }) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { role } = params;

    // Protect system roles
    if (DEFAULT_ROLES[role]) {
        return NextResponse.json({ message: `Cannot delete the system role "${role}".` }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection<RoleRecord>('roles').deleteOne({ name: role });

    if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'Role not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Role deleted.' });
}
