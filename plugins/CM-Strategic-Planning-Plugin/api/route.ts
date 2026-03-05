import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED = [
    { id: 'SP-001', title: 'AI & ML Upskilling Initiative 2026', description: 'Build internal ML capability to support AI platform roadmap.', targetYear: 2026, targetCompetencies: ['COMP-010', 'COMP-009'], currentGap: 'High', budget: 50000, budgetSpent: 12000, status: 'active', owner: 'David Park' },
    { id: 'SP-002', title: 'Cloud Architecture Centre of Excellence', description: 'Develop 5 certified AWS architects by Q3 2026.', targetYear: 2026, targetCompetencies: ['COMP-006', 'COMP-004'], currentGap: 'Critical', budget: 80000, budgetSpent: 25000, status: 'active', owner: 'Priya Sharma' },
    { id: 'SP-003', title: 'Leadership Pipeline Programme', description: 'Grow 3 senior engineers into management-ready candidates.', targetYear: 2026, targetCompetencies: ['COMP-012', 'COMP-020'], currentGap: 'Medium', budget: 30000, budgetSpent: 5000, status: 'planning', owner: 'James Liu' },
];
async function ensureSeed(db: any) {
    const count = await db.collection('cm_skill_plans').countDocuments();
    if (count > 0) return;
    for (const p of SEED) await db.collection('cm_skill_plans').updateOne({ id: p.id }, { $setOnInsert: { ...p, createdAt: new Date() } }, { upsert: true });
}
export async function GET(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise; const db = client.db(); await ensureSeed(db);
        const data = await db.collection('cm_skill_plans').find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ status: 'success', data });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        await db.collection('cm_skill_plans').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
