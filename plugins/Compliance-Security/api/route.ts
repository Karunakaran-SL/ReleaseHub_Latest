import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const [controlCount, criticalCount, incidentCount, openIncidents] = await Promise.all([
            db.collection('security_controls').countDocuments(),
            db.collection('security_controls').countDocuments({ severity: 'critical' }),
            db.collection('security_incidents').countDocuments(),
            db.collection('security_incidents').countDocuments({ status: 'open' }),
        ]);

        return NextResponse.json({
            success: true,
            data: { controlCount, criticalCount, incidentCount, openIncidents, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Security compliance API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load security compliance data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = body.type === 'incident'
            ? db.collection('security_incidents')
            : db.collection('security_controls');

        const result = await collection.insertOne({
            ...body,
            createdBy: user.username,
            createdAt: new Date(),
            status: body.status || 'open',
        });

        return NextResponse.json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
