import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise;
        const db = client.db();
        // Aggregate org-wide stats across shared cm_ collections
        const [empCount, skillCount, certCount, activeGaps] = await Promise.all([
            db.collection('cm_employees').countDocuments({ status: 'active' }),
            db.collection('cm_competencies').countDocuments({ status: 'active' }),
            db.collection('cm_certifications').countDocuments({ status: 'valid' }),
            db.collection('cm_skill_gaps').countDocuments(),
        ]);
        const byDept = await db.collection('cm_employees').aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        const skillCoverage = await db.collection('cm_employee_skills').aggregate([
            { $group: { _id: '$competencyId', holderCount: { $sum: 1 }, avgLevel: { $avg: '$currentLevel' } } },
            { $sort: { holderCount: -1 } },
            { $limit: 15 }
        ]).toArray();
        const validationPending = await db.collection('cm_employee_skills').countDocuments({ managerValidated: false });
        return NextResponse.json({ status: 'success', data: { empCount, skillCount, certCount, activeGaps, byDept, skillCoverage, validationPending } });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

// Analytics is read-only, no POST needed
export async function POST() {
    return NextResponse.json({ error: 'Analytics module is read-only' }, { status: 405 });
}
