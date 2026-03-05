import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
const SEED_FORUMS = [
    { id: 'FOR-001', title: 'Microservices vs Monolith — when to choose?', linkedCompetencyId: 'COMP-005', author: 'EMP-002', authorName: 'Priya Sharma', posts: 12, tags: ['architecture', 'design'], createdAt: new Date('2026-01-10') },
    { id: 'FOR-002', title: 'Terraform gotchas and tips', linkedCompetencyId: 'COMP-019', author: 'EMP-007', authorName: 'Tom Eriksson', posts: 8, tags: ['iac', 'devops'], createdAt: new Date('2026-01-20') },
    { id: 'FOR-003', title: 'How I passed the CKA exam', linkedCompetencyId: 'COMP-007', author: 'EMP-001', authorName: 'Alex Thornton', posts: 22, tags: ['kubernetes', 'certification'], createdAt: new Date('2025-12-15') },
];
const SEED_MENTORS = [
    { id: 'MNT-001', mentorId: 'EMP-002', menteeId: 'EMP-003', competencyId: 'COMP-001', mentorName: 'Priya Sharma', menteeName: 'Marcus Chen', status: 'active', startDate: '2026-01-01', goals: 'Improve Python to level 4' },
    { id: 'MNT-002', mentorId: 'EMP-007', menteeId: 'EMP-006', competencyId: 'COMP-007', mentorName: 'Tom Eriksson', menteeName: 'Aisha Kowalski', status: 'active', startDate: '2026-02-01', goals: 'Get CKA certified' },
];
async function ensureSeed(db: any) {
    const c = await db.collection('cm_forums').countDocuments(); if (c > 0) return;
    for (const f of SEED_FORUMS) await db.collection('cm_forums').updateOne({ id: f.id }, { $setOnInsert: f }, { upsert: true });
    for (const m of SEED_MENTORS) await db.collection('cm_mentorship').updateOne({ id: m.id }, { $setOnInsert: m }, { upsert: true });
}
export async function GET(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url); const module = searchParams.get('module') || 'forums';
    try {
        const client = await clientPromise; const db = client.db(); await ensureSeed(db);
        if (module === 'forums') { const data = await db.collection('cm_forums').find({}).sort({ createdAt: -1 }).toArray(); return NextResponse.json({ status: 'success', data }); }
        if (module === 'mentorship') { const data = await db.collection('cm_mentorship').find({}).toArray(); return NextResponse.json({ status: 'success', data }); }
        return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url); const module = searchParams.get('module') || 'forums';
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        const col = module === 'mentorship' ? 'cm_mentorship' : 'cm_forums';
        await db.collection(col).updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
