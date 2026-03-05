import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED = [
    { id: 'ASS-001', employeeId: 'EMP-003', assessorId: 'EMP-009', competencyId: 'COMP-001', assessedLevel: 2, type: 'manager', comments: 'Good fundamentals, needs to improve production code quality.', date: new Date('2025-10-15'), status: 'completed' },
    { id: 'ASS-002', employeeId: 'EMP-001', assessorId: 'EMP-001', competencyId: 'COMP-008', assessedLevel: 3, type: 'self', comments: 'Confident with basic CI/CD, need more complex pipeline exposure.', date: new Date('2025-11-01'), status: 'completed' },
    { id: 'ASS-003', employeeId: 'EMP-010', assessorId: 'EMP-009', competencyId: 'COMP-009', assessedLevel: 3, type: 'manager', comments: 'Solid foundational skills. Ready for more complex ETL patterns.', date: new Date('2025-09-20'), status: 'completed' },
    { id: 'ASS-004', employeeId: 'EMP-006', assessorId: 'EMP-006', competencyId: 'COMP-001', assessedLevel: 2, type: 'self', comments: '', date: new Date('2026-01-10'), status: 'pending' },
    { id: 'ASS-005', employeeId: 'EMP-006', assessorId: 'EMP-009', competencyId: 'COMP-001', assessedLevel: null, type: 'manager', comments: '', date: null, status: 'pending' },
];

async function ensureSeed(db: any) {
    const count = await db.collection('cm_assessments').countDocuments();
    if (count > 0) return;
    for (const a of SEED) await db.collection('cm_assessments').updateOne({ id: a.id }, { $setOnInsert: { ...a, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    try {
        const client = await clientPromise;
        const db = client.db();
        await ensureSeed(db);
        const filter: any = {};
        if (employeeId) filter.employeeId = employeeId;
        if (type) filter.type = type;
        if (status) filter.status = status;
        const data = await db.collection('cm_assessments').find(filter).sort({ date: -1 }).toArray();
        const pending = await db.collection('cm_assessments').countDocuments({ status: 'pending' });
        return NextResponse.json({ status: 'success', data, pending });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json();
        const { _id, ...data } = body;
        const client = await clientPromise;
        const db = client.db();
        await db.collection('cm_assessments').updateOne(
            { id: data.id },
            { $set: { ...data, updatedAt: new Date(), updatedBy: user.email }, $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
        );
        // If completed, update the employee skill level
        if (data.status === 'completed' && data.assessedLevel && data.employeeId && data.competencyId) {
            await db.collection('cm_employee_skills').updateOne(
                { employeeId: data.employeeId, competencyId: data.competencyId },
                { $set: data.type === 'manager' ? { currentLevel: data.assessedLevel, managerValidated: true, validatedBy: user.email, lastReviewed: new Date() } : { selfAssessedLevel: data.assessedLevel } },
                { upsert: false }
            );
        }
        await db.collection('cm_audit_logs').insertOne({ module: 'cm-assessments', action: 'UPSERT', entityId: data.id, performedBy: user.email, timestamp: new Date() });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
