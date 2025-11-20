import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const COLLECTION_NAME = 'sdk_apps';

// List all saved SDK apps
export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection(COLLECTION_NAME).find({ createdBy: user.username }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new SDK app configuration
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Basic validation can be added here with Zod if needed

        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...body,
            createdBy: user.username,
            createdAt: new Date().toISOString(),
        };
        
        const result = await db.collection(COLLECTION_NAME).insertOne(newItem as any);

        const finalItem = { ...newItem, _id: result.insertedId };

        return NextResponse.json(finalItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
