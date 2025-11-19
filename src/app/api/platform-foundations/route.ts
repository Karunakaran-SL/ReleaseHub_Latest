
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const COLLECTION_NAME = 'platform_foundations';

// GET all platform foundations
export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const items = await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray();

        return NextResponse.json(items, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch platform foundations:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Create a new platform foundation
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Basic validation
        if (!body.name || !body.specification) {
             return NextResponse.json({ message: 'Invalid data. Name and specification are required.' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...body,
            _id: `${body.name.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
            createdBy: user.username,
            createdAt: new Date().toISOString(),
        };
        
        await db.collection(COLLECTION_NAME).insertOne(newItem as any);

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error('Failed to create platform foundation:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
