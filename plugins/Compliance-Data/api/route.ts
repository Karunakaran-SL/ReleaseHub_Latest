import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const [assetCount, classifiedCount, dsarCount, openDsar] = await Promise.all([
            db.collection('data_assets').countDocuments(),
            db.collection('data_assets').countDocuments({ classified: true }),
            db.collection('dsar_requests').countDocuments(),
            db.collection('dsar_requests').countDocuments({ status: 'pending' }),
        ]);

        return NextResponse.json({
            success: true,
            data: { assetCount, classifiedCount, dsarCount, openDsar, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Data compliance API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load data compliance info' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = body.type === 'dsar'
            ? db.collection('dsar_requests')
            : db.collection('data_assets');

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
