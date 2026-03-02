import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        // 1. Authenticate the request
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized Access to Plugin API' }, { status: 401 });
        }

        // 2. Safely connect to MongoDB
        const client = await clientPromise;
        const db = client.db();

        // 3. Create a unique collection for this plugin to avoid collisions
        const collection = db.collection('plugin_sample_data');

        // For demonstration, we just return a success message and check if the collection is accessible
        const documentCount = await collection.countDocuments();

        return NextResponse.json({
            success: true,
            message: 'Sample Plugin API executed successfully!',
            data: {
                user: user.username,
                documentCount,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("Plugin API Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to execute plugin logic' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('plugin_sample_data');

        const result = await collection.insertOne({
            ...body,
            createdBy: user.id,
            createdAt: new Date()
        });

        return NextResponse.json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
