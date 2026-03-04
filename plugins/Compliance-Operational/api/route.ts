import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const [sopCount, approvedSops, deviationCount, openDeviations] = await Promise.all([
            db.collection('sops').countDocuments(),
            db.collection('sops').countDocuments({ status: 'approved' }),
            db.collection('operational_deviations').countDocuments(),
            db.collection('operational_deviations').countDocuments({ status: 'open' }),
        ]);

        return NextResponse.json({
            success: true,
            data: { sopCount, approvedSops, deviationCount, openDeviations, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Operational compliance API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load operational compliance data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = body.type === 'deviation'
            ? db.collection('operational_deviations')
            : db.collection('sops');

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
