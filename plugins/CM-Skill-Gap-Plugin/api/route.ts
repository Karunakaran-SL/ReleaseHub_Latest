import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_GAPS = [
    { id: 'GAP-001', employeeId: 'EMP-001', roleId: 'ROLE-001', gaps: [{ competencyId: 'COMP-003', name: 'Java / Spring Boot', requiredLevel: 3, currentLevel: 1, gap: 2 }, { competencyId: 'COMP-007', name: 'Kubernetes & Docker', requiredLevel: 3, currentLevel: 2, gap: 1 }], totalGap: 3, calculatedAt: new Date('2026-01-15') },
    { id: 'GAP-002', employeeId: 'EMP-003', roleId: 'ROLE-003', gaps: [{ competencyId: 'COMP-001', name: 'Python Programming', requiredLevel: 2, currentLevel: 1, gap: 1 }, { competencyId: 'COMP-013', name: 'Agile / Scrum', requiredLevel: 1, currentLevel: 0, gap: 1 }, { competencyId: 'COMP-014', name: 'Technical Communication', requiredLevel: 1, currentLevel: 0, gap: 1 }, { competencyId: 'COMP-002', name: 'TypeScript / JavaScript', requiredLevel: 2, currentLevel: 1, gap: 1 }], totalGap: 4, calculatedAt: new Date('2026-01-20') },
    { id: 'GAP-003', employeeId: 'EMP-010', roleId: 'ROLE-009', gaps: [{ competencyId: 'COMP-009', name: 'Data Engineering', requiredLevel: 4, currentLevel: 3, gap: 1 }, { competencyId: 'COMP-010', name: 'Machine Learning', requiredLevel: 3, currentLevel: 2, gap: 1 }, { competencyId: 'COMP-017', name: 'MongoDB / NoSQL', requiredLevel: 3, currentLevel: 1, gap: 2 }, { competencyId: 'COMP-001', name: 'Python Programming', requiredLevel: 3, currentLevel: 2, gap: 1 }], totalGap: 5, calculatedAt: new Date('2026-01-22') },
];

async function ensureSeed(db: any) {
    const count = await db.collection('cm_skill_gaps').countDocuments();
    if (count > 0) return;
    for (const g of SEED_GAPS) await db.collection('cm_skill_gaps').updateOne({ id: g.id }, { $setOnInsert: { ...g, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    try {
        const client = await clientPromise;
        const db = client.db();
        await ensureSeed(db);
        const filter: any = {};
        if (employeeId) filter.employeeId = employeeId;
        const data = await db.collection('cm_skill_gaps').find(filter).sort({ calculatedAt: -1 }).toArray();
        // Aggregate: top gaps across org
        const topGaps = await db.collection('cm_skill_gaps').aggregate([
            { $unwind: '$gaps' },
            { $group: { _id: '$gaps.competencyId', name: { $first: '$gaps.name' }, totalGap: { $sum: '$gaps.gap' }, affectedEmployees: { $sum: 1 } } },
            { $sort: { totalGap: -1 } },
            { $limit: 10 }
        ]).toArray();
        return NextResponse.json({ status: 'success', data, topGaps });
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
        // Auto-compute gaps
        if (Array.isArray(data.gaps)) {
            data.gaps = data.gaps.map((g: any) => ({ ...g, gap: Math.max(0, (g.requiredLevel || 0) - (g.currentLevel || 0)) }));
            data.totalGap = data.gaps.reduce((s: number, g: any) => s + g.gap, 0);
        }
        await db.collection('cm_skill_gaps').updateOne(
            { id: data.id },
            { $set: { ...data, calculatedAt: new Date() } },
            { upsert: true }
        );
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
