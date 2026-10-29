import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_PATHS = [
    { id: 'CP-001', fromRoleId: 'ROLE-003', toRoleId: 'ROLE-001', fromRole: 'Junior Software Engineer', toRole: 'Senior Backend Engineer', estimatedMonths: 24, requiredCompetencies: ['COMP-001', 'COMP-003', 'COMP-007'], milestones: ['Complete system design course', 'Lead one significant feature', 'Mentor a junior engineer'] },
    { id: 'CP-002', fromRoleId: 'ROLE-001', toRoleId: 'ROLE-002', fromRole: 'Senior Backend Engineer', toRole: 'Principal Engineer', estimatedMonths: 36, requiredCompetencies: ['COMP-004', 'COMP-005', 'COMP-012'], milestones: ['Design a major system', 'Present to CTO', 'Lead a team for 6+ months'] },
    { id: 'CP-003', fromRoleId: 'ROLE-001', toRoleId: 'ROLE-008', fromRole: 'Senior Backend Engineer', toRole: 'Engineering Manager', estimatedMonths: 18, requiredCompetencies: ['COMP-012', 'COMP-020', 'COMP-013'], milestones: ['Manage a project delivery', 'Conduct performance reviews', 'Hire 2+ engineers'] },
    { id: 'CP-004', fromRoleId: 'ROLE-003', toRoleId: 'ROLE-006', fromRole: 'Junior Software Engineer', toRole: 'DevOps Engineer', estimatedMonths: 18, requiredCompetencies: ['COMP-006', 'COMP-007', 'COMP-008'], milestones: ['Get AWS certified', 'Own a CI/CD pipeline', 'Get CKA certified'] },
];
async function ensureSeed(db: any) {
    const count = await db.collection('cm_career_paths').countDocuments();
    if (count > 0) return;
    for (const p of SEED_PATHS) await db.collection('cm_career_paths').updateOne({ id: p.id }, { $setOnInsert: { ...p, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise; const db = client.db();
        await ensureSeed(db);
        const data = await db.collection('cm_career_paths').find({}).toArray();
        return NextResponse.json({ status: 'success', data });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        await db.collection('cm_career_paths').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
