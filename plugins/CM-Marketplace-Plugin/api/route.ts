import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_OPPS = [
    { id: 'OPP-001', title: 'AI Platform Team – Python Lead', description: 'Lead development of our internal AI platform using Python and FastAPI.', requiredCompetencies: [{ competencyId: 'COMP-001', minLevel: 4 }, { competencyId: 'COMP-010', minLevel: 3 }], commitment: '6 months', department: 'Engineering', status: 'open', createdAt: new Date('2026-01-15'), applications: [] },
    { id: 'OPP-002', title: 'Cloud Migration – Architecture Lead', description: 'Architect and lead migration of legacy services to AWS.', requiredCompetencies: [{ competencyId: 'COMP-006', minLevel: 4 }, { competencyId: 'COMP-004', minLevel: 4 }], commitment: '12 months', department: 'Engineering', status: 'open', createdAt: new Date('2026-02-01'), applications: [] },
    { id: 'OPP-003', title: 'Design System Contributor', description: 'Build and document the company-wide component design system.', requiredCompetencies: [{ competencyId: 'COMP-018', minLevel: 3 }, { competencyId: 'COMP-002', minLevel: 2 }], commitment: '3 months', department: 'Design', status: 'open', createdAt: new Date('2026-02-10'), applications: [] },
];
async function ensureSeed(db: any) {
    const count = await db.collection('cm_opportunities').countDocuments();
    if (count > 0) return;
    for (const o of SEED_OPPS) await db.collection('cm_opportunities').updateOne({ id: o.id }, { $setOnInsert: { ...o, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise; const db = client.db();
        await ensureSeed(db);
        const data = await db.collection('cm_opportunities').find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ status: 'success', data });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        if (data.actionType === 'APPLY') {
            await db.collection('cm_opportunities').updateOne({ id: data.opportunityId }, { $addToSet: { applications: { employeeId: data.employeeId, appliedAt: new Date(), status: 'pending' } } });
        } else {
            data.createdAt = data.createdAt || new Date();
            await db.collection('cm_opportunities').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        }
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
