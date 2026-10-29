import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_PERF = [
    { id: 'PERF-001', employeeId: 'EMP-001', employeeName: 'Alex Thornton', performanceScore: 4.2, linkedCompetencies: ['COMP-001', 'COMP-002', 'COMP-008'], year: 2025, quarter: 'Q4', reviewerName: 'David Park', strengths: 'Strong code quality and reliability', improvements: 'Needs to expand cloud skills' },
    { id: 'PERF-002', employeeId: 'EMP-002', employeeName: 'Priya Sharma', performanceScore: 4.8, linkedCompetencies: ['COMP-001', 'COMP-004', 'COMP-005'], year: 2025, quarter: 'Q4', reviewerName: 'David Park', strengths: 'Exceptional architecture, mentors others effectively', improvements: 'Could improve stakeholder comms' },
    { id: 'PERF-003', employeeId: 'EMP-007', employeeName: 'Tom Eriksson', performanceScore: 4.0, linkedCompetencies: ['COMP-006', 'COMP-007'], year: 2025, quarter: 'Q4', reviewerName: 'David Park', strengths: 'Reliable infrastructure, owns full CI/CD stack', improvements: 'Document processes better' },
];
const SEED_FEEDBACK = [
    { id: 'FB-001', employeeId: 'EMP-001', fromEmployeeId: 'EMP-002', competencyId: 'COMP-001', rating: 4, comment: 'Alex consistently writes quality Python code and helps the team.', year: 2025 },
    { id: 'FB-002', employeeId: 'EMP-002', fromEmployeeId: 'EMP-001', competencyId: 'COMP-004', rating: 5, comment: 'Priya is the best architect in the team. Always has great design instincts.', year: 2025 },
];
async function ensureSeed(db: any) {
    const count = await db.collection('cm_performance').countDocuments();
    if (count > 0) return;
    for (const p of SEED_PERF) await db.collection('cm_performance').updateOne({ id: p.id }, { $setOnInsert: { ...p, createdAt: new Date() } }, { upsert: true });
    for (const f of SEED_FEEDBACK) await db.collection('cm_360_feedback').updateOne({ id: f.id }, { $setOnInsert: { ...f, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'reviews';
    const employeeId = searchParams.get('employeeId');
    try {
        const client = await clientPromise; const db = client.db();
        await ensureSeed(db);
        if (module === 'reviews') {
            const filter: any = {}; if (employeeId) filter.employeeId = employeeId;
            const data = await db.collection('cm_performance').find(filter).sort({ year: -1 }).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        if (module === 'feedback') {
            const data = await db.collection('cm_360_feedback').find({ employeeId }).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'reviews';
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        const col = module === 'feedback' ? 'cm_360_feedback' : 'cm_performance';
        await db.collection(col).updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
