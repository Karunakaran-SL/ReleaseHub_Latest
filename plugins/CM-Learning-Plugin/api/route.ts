import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_COURSES = [
    { id: 'CRS-001', title: 'Advanced Python for Engineers', linkedCompetencies: ['COMP-001'], provider: 'Pluralsight', durationHours: 14, difficulty: 'Intermediate', format: 'Video', active: true, url: 'https://pluralsight.com', targetLevel: 4, cost: 299 },
    { id: 'CRS-002', title: 'System Design Interview Masterclass', linkedCompetencies: ['COMP-004', 'COMP-005'], provider: 'ByteByteGo', durationHours: 20, difficulty: 'Advanced', format: 'Video', active: true, url: 'https://bytebytego.com', targetLevel: 5, cost: 79 },
    { id: 'CRS-003', title: 'AWS Solutions Architect Prep', linkedCompetencies: ['COMP-006'], provider: 'A Cloud Guru', durationHours: 30, difficulty: 'Intermediate', format: 'Video + Labs', active: true, url: 'https://acloudguru.com', targetLevel: 4, cost: 399 },
    { id: 'CRS-004', title: 'Kubernetes: Zero to Hero', linkedCompetencies: ['COMP-007'], provider: 'Udemy', durationHours: 22, difficulty: 'Intermediate', format: 'Video', active: true, url: 'https://udemy.com', targetLevel: 4, cost: 24 },
    { id: 'CRS-005', title: 'Machine Learning Engineering', linkedCompetencies: ['COMP-010'], provider: 'Coursera', durationHours: 40, difficulty: 'Advanced', format: 'University Course', active: true, url: 'https://coursera.org', targetLevel: 4, cost: 599 },
    { id: 'CRS-006', title: 'Terraform & IaC Fundamentals', linkedCompetencies: ['COMP-019'], provider: 'HashiCorp Learn', durationHours: 10, difficulty: 'Beginner', format: 'Interactive', active: true, url: 'https://learn.hashicorp.com', targetLevel: 2, cost: 0 },
    { id: 'CRS-007', title: 'Leadership for Technical Leads', linkedCompetencies: ['COMP-012', 'COMP-020'], provider: 'LinkedIn Learning', durationHours: 8, difficulty: 'Beginner', format: 'Video', active: true, url: 'https://linkedin.com/learning', targetLevel: 3, cost: 49 },
    { id: 'CRS-008', title: 'Product Management Fundamentals', linkedCompetencies: ['COMP-015'], provider: 'Product School', durationHours: 16, difficulty: 'Beginner', format: 'Live', active: true, url: 'https://productschool.com', targetLevel: 3, cost: 799 },
];

async function ensureSeed(db: any) {
    const count = await db.collection('cm_courses').countDocuments();
    if (count > 0) return;
    for (const c of SEED_COURSES) await db.collection('cm_courses').updateOne({ id: c.id }, { $setOnInsert: { ...c, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'courses';
    const employeeId = searchParams.get('employeeId');
    try {
        const client = await clientPromise;
        const db = client.db();
        await ensureSeed(db);
        if (module === 'courses') {
            const data = await db.collection('cm_courses').find({ active: true }).sort({ title: 1 }).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        if (module === 'plans') {
            const filter: any = {};
            if (employeeId) filter.employeeId = employeeId;
            const data = await db.collection('cm_dev_plans').find(filter).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'courses';
    try {
        const body = await request.json();
        const { _id, ...data } = body;
        const client = await clientPromise;
        const db = client.db();
        if (module === 'courses') {
            await db.collection('cm_courses').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        } else if (module === 'plans') {
            await db.collection('cm_dev_plans').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
            // If marked complete, bump employee skill level
            if (data.status === 'completed' && data.employeeId && data.competencyId && data.targetLevel) {
                await db.collection('cm_employee_skills').updateOne(
                    { employeeId: data.employeeId, competencyId: data.competencyId },
                    { $set: { currentLevel: data.targetLevel, lastReviewed: new Date() } }
                );
            }
        }
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
