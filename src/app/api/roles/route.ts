import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DEFAULT_ROLES } from '@/lib/permissions';
import type { RoleRecord } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { isAdminRole } from '@/lib/role-utils';

// GET /api/roles — list all roles with permissions
export async function GET() {
    const client = await clientPromise;
    const db = client.db();

    // Load roles from DB, fall back to defaults for missing ones
    const dbRoles = await db.collection<RoleRecord>('roles').find({}).toArray();
    const dbRolesMap = Object.fromEntries(dbRoles.map(r => [r.name, r]));

    const roles = Object.entries(DEFAULT_ROLES).map(([name, defaultDef]) => {
        const dbRole = dbRolesMap[name];
        return {
            name,
            label: dbRole?.label ?? defaultDef.label,
            description: dbRole?.description ?? defaultDef.description,
            permissions: dbRole?.permissions ?? (defaultDef.permissions as Record<string, string[]>),
            isDefault: !dbRole,
        };
    });

    // Add any custom roles only in DB
    for (const dbRole of dbRoles) {
        if (!DEFAULT_ROLES[dbRole.name]) {
            roles.push({
                name: dbRole.name,
                label: dbRole.label,
                description: dbRole.description,
                permissions: dbRole.permissions,
                isDefault: false,
            });
        }
    }

    return NextResponse.json({ roles });
}

// POST /api/roles — create a new custom role (admin only)
export async function POST(req: Request) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, label, description, permissions } = await req.json();

    if (!name || !label) {
        return NextResponse.json({ message: 'name and label are required.' }, { status: 400 });
    }
    // Validate role name format (lowercase, underscores, no spaces)
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
        return NextResponse.json({ message: 'Role name must be lowercase letters, numbers, and underscores only.' }, { status: 400 });
    }
    // Cannot overwrite system roles
    if (DEFAULT_ROLES[name]) {
        return NextResponse.json({ message: `"${name}" is a reserved system role name.` }, { status: 409 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection<RoleRecord>('roles').findOne({ name });
    if (existing) {
        return NextResponse.json({ message: 'A role with this name already exists.' }, { status: 409 });
    }

    const now = new Date().toISOString();
    await db.collection<RoleRecord>('roles').insertOne({
        name,
        label,
        description: description ?? '',
        permissions: permissions ?? {},
        isDefault: false,
        createdAt: now,
        createdBy: currentUser.username,
        updatedAt: now,
    } as any);

    return NextResponse.json({ message: 'Role created.' }, { status: 201 });
}
