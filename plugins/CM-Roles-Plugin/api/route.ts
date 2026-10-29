import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_ROLES = [
    { id: 'ROLE-001', name: 'Senior Backend Engineer', department: 'Engineering', level: 'Senior', competencies: [{ competencyId: 'COMP-001', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-003', requiredLevel: 3, mandatory: true, weight: 20 }, { competencyId: 'COMP-007', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-008', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-013', requiredLevel: 2, mandatory: false, weight: 10 }, { competencyId: 'COMP-014', requiredLevel: 2, mandatory: false, weight: 15 }] },
    { id: 'ROLE-002', name: 'Principal Engineer', department: 'Engineering', level: 'Principal', competencies: [{ competencyId: 'COMP-004', requiredLevel: 5, mandatory: true, weight: 30 }, { competencyId: 'COMP-005', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-001', requiredLevel: 5, mandatory: true, weight: 20 }, { competencyId: 'COMP-012', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-020', requiredLevel: 3, mandatory: false, weight: 10 }] },
    { id: 'ROLE-003', name: 'Junior Software Engineer', department: 'Engineering', level: 'Junior', competencies: [{ competencyId: 'COMP-001', requiredLevel: 2, mandatory: true, weight: 35 }, { competencyId: 'COMP-002', requiredLevel: 2, mandatory: true, weight: 30 }, { competencyId: 'COMP-013', requiredLevel: 1, mandatory: false, weight: 20 }, { competencyId: 'COMP-014', requiredLevel: 1, mandatory: false, weight: 15 }] },
    { id: 'ROLE-004', name: 'Product Manager', department: 'Product', level: 'Mid', competencies: [{ competencyId: 'COMP-015', requiredLevel: 4, mandatory: true, weight: 35 }, { competencyId: 'COMP-020', requiredLevel: 4, mandatory: true, weight: 30 }, { competencyId: 'COMP-013', requiredLevel: 3, mandatory: false, weight: 20 }, { competencyId: 'COMP-014', requiredLevel: 4, mandatory: false, weight: 15 }] },
    { id: 'ROLE-005', name: 'Head of Product', department: 'Product', level: 'Head', competencies: [{ competencyId: 'COMP-015', requiredLevel: 5, mandatory: true, weight: 30 }, { competencyId: 'COMP-012', requiredLevel: 5, mandatory: true, weight: 30 }, { competencyId: 'COMP-020', requiredLevel: 5, mandatory: true, weight: 25 }, { competencyId: 'COMP-014', requiredLevel: 4, mandatory: false, weight: 15 }] },
    { id: 'ROLE-006', name: 'DevOps Engineer', department: 'DevOps', level: 'Mid', competencies: [{ competencyId: 'COMP-006', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-007', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-008', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-019', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-011', requiredLevel: 2, mandatory: false, weight: 10 }] },
    { id: 'ROLE-007', name: 'UX Designer', department: 'Design', level: 'Mid', competencies: [{ competencyId: 'COMP-018', requiredLevel: 4, mandatory: true, weight: 50 }, { competencyId: 'COMP-014', requiredLevel: 3, mandatory: false, weight: 30 }, { competencyId: 'COMP-013', requiredLevel: 2, mandatory: false, weight: 20 }] },
    { id: 'ROLE-008', name: 'Engineering Manager', department: 'Engineering', level: 'Manager', competencies: [{ competencyId: 'COMP-012', requiredLevel: 5, mandatory: true, weight: 35 }, { competencyId: 'COMP-020', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-004', requiredLevel: 3, mandatory: false, weight: 20 }, { competencyId: 'COMP-013', requiredLevel: 4, mandatory: false, weight: 20 }] },
    { id: 'ROLE-009', name: 'Data Engineer', department: 'Data', level: 'Mid', competencies: [{ competencyId: 'COMP-009', requiredLevel: 4, mandatory: true, weight: 35 }, { competencyId: 'COMP-010', requiredLevel: 3, mandatory: true, weight: 25 }, { competencyId: 'COMP-017', requiredLevel: 3, mandatory: false, weight: 25 }, { competencyId: 'COMP-001', requiredLevel: 3, mandatory: false, weight: 15 }] },
];

async function ensureSeed(db: any) {
    const count = await db.collection('cm_roles').countDocuments();
    if (count > 0) return;
    for (const role of SEED_ROLES) {
        await db.collection('cm_roles').updateOne({ id: role.id }, { $setOnInsert: { ...role, createdAt: new Date() } }, { upsert: true });
    }
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    try {
        const client = await clientPromise;
        const db = client.db();
        await ensureSeed(db);
        if (id) {
            const role = await db.collection('cm_roles').findOne({ id });
            return NextResponse.json({ status: 'success', data: role });
        }
        const data = await db.collection('cm_roles').find({}).sort({ department: 1, name: 1 }).toArray();
        return NextResponse.json({ status: 'success', data });
    } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json();
        const { _id, ...data } = body;
        const client = await clientPromise;
        const db = client.db();
        await db.collection('cm_roles').updateOne(
            { id: data.id },
            { $set: { ...data, updatedAt: new Date(), updatedBy: user.email }, $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
        );
        await db.collection('cm_audit_logs').insertOne({ module: 'cm-roles', action: 'UPSERT', entityId: data.id, performedBy: user.email, timestamp: new Date() });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
