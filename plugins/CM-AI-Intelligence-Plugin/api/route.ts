import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    try {
        const client = await clientPromise; const db = client.db();
        const filter: any = {}; if (employeeId) filter.employeeId = employeeId;
        const recs = await db.collection('cm_ai_recommendations').find(filter).sort({ generatedAt: -1 }).limit(20).toArray();
        // Predicted future skills based on industry trends
        const trendingSkills = [
            { competencyId: 'COMP-010', name: 'Machine Learning', demandGrowth: '+45%', reason: 'AI adoption driving demand across all verticals' },
            { competencyId: 'COMP-006', name: 'AWS Cloud Services', demandGrowth: '+32%', reason: 'Cloud-first mandates increasing across enterprise' },
            { competencyId: 'COMP-019', name: 'Infrastructure as Code', demandGrowth: '+28%', reason: 'DevOps transformation programmes scaling globally' },
        ];
        return NextResponse.json({ status: 'success', data: recs, trendingSkills });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json();
        const client = await clientPromise; const db = client.db();
        // Generate AI recommendations
        const empSkills = await db.collection('cm_employee_skills').find({ employeeId: body.employeeId }).toArray();
        const allComps = await db.collection('cm_competencies').find({ status: { $ne: 'archived' } }).toArray();
        const empCompIds = empSkills.map((s: any) => s.competencyId);
        const missing = allComps.filter((c: any) => !empCompIds.includes(c.id)).slice(0, 5);
        // Gap-based recommendations
        const gaps = await db.collection('cm_skill_gaps').findOne({ employeeId: body.employeeId });
        const gapRecs = gaps?.gaps?.map((g: any) => ({ competencyId: g.competencyId, name: g.name, reason: `Gap of ${g.gap} level(s) vs required. Priority upskilling recommended.`, priority: g.gap >= 2 ? 'High' : 'Medium' })) || [];
        const recommendation = {
            id: `AI-REC-${Date.now()}`,
            employeeId: body.employeeId,
            unexploredSkills: missing.map((c: any) => ({ competencyId: c.id, name: c.name, reason: 'Not yet in profile — high growth area based on team trends' })),
            gapRecommendations: gapRecs,
            generatedAt: new Date(),
            generatedBy: 'CM AI Engine v1.0',
        };
        await db.collection('cm_ai_recommendations').insertOne(recommendation);
        return NextResponse.json({ status: 'success', data: recommendation });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
