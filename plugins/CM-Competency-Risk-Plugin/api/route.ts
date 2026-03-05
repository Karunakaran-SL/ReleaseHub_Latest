import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_RISKS = [
    { id: 'CRSK-001', title: 'Single point of expertise: Cloud Architecture', description: 'Only one engineer holds deep expertise. Departure = critical capability loss.', criticalCompetencyId: 'COMP-004', competencyName: 'System Architecture', riskScore: 85, riskLevel: 'Critical', expertCount: 1, mitigationPlan: 'Enroll 2 engineers in architecture upskilling', status: 'open' },
    { id: 'CRSK-002', title: 'Machine Learning skills deficit', description: 'Team lacks ML for upcoming AI initiatives.', criticalCompetencyId: 'COMP-010', competencyName: 'Machine Learning', riskScore: 72, riskLevel: 'High', expertCount: 1, mitigationPlan: 'Partner with ML consultants, start 3-month training', status: 'open' },
    { id: 'CRSK-003', title: 'Security certifications aging', description: 'AppSec certs for 2 members expire Q2 2026.', criticalCompetencyId: 'COMP-011', competencyName: 'Application Security', riskScore: 55, riskLevel: 'Medium', expertCount: 3, mitigationPlan: 'Schedule renewal Q1 2026', status: 'monitoring' },
];
async function ensureSeed(db: any) {
    const count = await db.collection('cm_comp_risks').countDocuments();
    if (count > 0) return;
    for (const r of SEED_RISKS) await db.collection('cm_comp_risks').updateOne({ id: r.id }, { $setOnInsert: { ...r, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise; const db = client.db();
        await ensureSeed(db);
        const data = await db.collection('cm_comp_risks').find({}).sort({ riskScore: -1 }).toArray();
        return NextResponse.json({ status: 'success', data });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        await db.collection('cm_comp_risks').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
