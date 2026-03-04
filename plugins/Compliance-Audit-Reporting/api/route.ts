import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const [auditCount, scheduledAudits, findingCount, openFindings] = await Promise.all([
            db.collection('compliance_audits').countDocuments(),
            db.collection('compliance_audits').countDocuments({ status: 'scheduled' }),
            db.collection('audit_findings').countDocuments(),
            db.collection('audit_findings').countDocuments({ status: 'open' }),
        ]);

        return NextResponse.json({
            success: true,
            data: { auditCount, scheduledAudits, findingCount, openFindings, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Audit reporting API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load audit data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = body.type === 'finding'
            ? db.collection('audit_findings')
            : db.collection('compliance_audits');

        const result = await collection.insertOne({
            ...body,
            createdBy: user.username,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
