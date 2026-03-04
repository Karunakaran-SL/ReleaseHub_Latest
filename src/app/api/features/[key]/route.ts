import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { FEATURES, FEATURE_LABELS } from '@/lib/permissions';
import { getUser } from '@/lib/auth';
import { isAdminRole } from '@/lib/role-utils';

const SYSTEM_FEATURE_KEYS = Object.values(FEATURES) as string[];

// GET /api/features/[key] — get a single feature
export async function GET(_req: Request, { params }: { params: { key: string } }) {
    const { key } = params;
    const client = await clientPromise;
    const db = client.db();

    const dbFeature = await db.collection('features').findOne({ key });
    const isSystem = SYSTEM_FEATURE_KEYS.includes(key);

    if (!dbFeature && !isSystem) {
        return NextResponse.json({ message: 'Feature not found.' }, { status: 404 });
    }

    return NextResponse.json({
        key,
        label: dbFeature?.label ?? FEATURE_LABELS[key as keyof typeof FEATURE_LABELS] ?? key,
        description: dbFeature?.description ?? '',
        isSystem,
        pluginId: dbFeature?.pluginId ?? null,
    });
}

// PUT /api/features/[key] — update a feature's label/description (admin only)
export async function PUT(req: Request, { params }: { params: { key: string } }) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { key } = params;
    const { label, description } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    await db.collection('features').updateOne(
        { key },
        { $set: { key, label, description: description ?? '', updatedAt: new Date().toISOString() } },
        { upsert: true }
    );

    return NextResponse.json({ message: 'Feature updated.' });
}

// DELETE /api/features/[key] — delete a custom feature (admin only, cannot delete system features)
export async function DELETE(_req: Request, { params }: { params: { key: string } }) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { key } = params;

    if (SYSTEM_FEATURE_KEYS.includes(key)) {
        return NextResponse.json({ message: `Cannot delete the system feature "${key}".` }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('features').deleteOne({ key });

    if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'Feature not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Feature deleted.' });
}
