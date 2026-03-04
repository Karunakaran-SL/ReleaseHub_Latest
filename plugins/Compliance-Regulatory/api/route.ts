import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const [frameworkCount, certifiedCount, evidenceCount, pendingEvidence] = await Promise.all([
            db.collection('regulatory_frameworks').countDocuments(),
            db.collection('regulatory_frameworks').countDocuments({ certified: true }),
            db.collection('compliance_evidence').countDocuments(),
            db.collection('compliance_evidence').countDocuments({ status: 'pending' }),
        ]);

        return NextResponse.json({
            success: true,
            data: { frameworkCount, certifiedCount, evidenceCount, pendingEvidence, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Regulatory compliance API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load regulatory compliance data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = body.type === 'evidence'
            ? db.collection('compliance_evidence')
            : db.collection('regulatory_frameworks');

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
