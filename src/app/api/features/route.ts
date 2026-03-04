import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { FEATURES, FEATURE_LABELS } from '@/lib/permissions';
import { getUser } from '@/lib/auth';
import { isAdminRole } from '@/lib/role-utils';

// System features (built-in, cannot be deleted)
const SYSTEM_FEATURE_KEYS = Object.values(FEATURES) as string[];

// GET /api/features — list all features (system + DB custom + plugin)
export async function GET() {
    const client = await clientPromise;
    const db = client.db();

    const dbFeatures = await db.collection('features').find({}).toArray();
    const dbFeatureMap = Object.fromEntries(dbFeatures.map((f: any) => [f.key, f]));

    // Start with built-in system features
    const systemFeatures = SYSTEM_FEATURE_KEYS.map(key => ({
        key,
        label: FEATURE_LABELS[key as keyof typeof FEATURE_LABELS] ?? key,
        description: '',
        isSystem: true,
        pluginId: null,
        ...(dbFeatureMap[key] ?? {}),  // allow label/description overrides from DB
    }));

    // Add custom/plugin features from DB that aren't in system list
    const customFeatures = dbFeatures
        .filter((f: any) => !SYSTEM_FEATURE_KEYS.includes(f.key))
        .map((f: any) => ({
            key: f.key,
            label: f.label,
            description: f.description ?? '',
            isSystem: false,
            pluginId: f.pluginId ?? null,
            createdAt: f.createdAt,
            createdBy: f.createdBy,
        }));

    return NextResponse.json({ features: [...systemFeatures, ...customFeatures] });
}

// POST /api/features — create a new custom feature (admin only)
export async function POST(req: Request) {
    const currentUser = await getUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { key, label, description, pluginId } = await req.json();

    if (!key || !label) {
        return NextResponse.json({ message: 'key and label are required.' }, { status: 400 });
    }
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
        return NextResponse.json({ message: 'Feature key must be lowercase letters, numbers, and underscores only.' }, { status: 400 });
    }
    if (SYSTEM_FEATURE_KEYS.includes(key)) {
        return NextResponse.json({ message: `"${key}" is a reserved system feature.` }, { status: 409 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection('features').findOne({ key });
    if (existing) {
        return NextResponse.json({ message: 'A feature with this key already exists.' }, { status: 409 });
    }

    const now = new Date().toISOString();
    await db.collection('features').insertOne({
        key,
        label,
        description: description ?? '',
        isSystem: false,
        pluginId: pluginId ?? null,
        createdAt: now,
        createdBy: currentUser.username,
    });

    return NextResponse.json({ message: 'Feature created.' }, { status: 201 });
}
