
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const COLLECTION_NAME = 'test_environments';

// List all test environments
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
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new test environment
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        // Basic validation
        if (!body.name || !body.productId || !body.specificationId) {
            return NextResponse.json({ message: 'Missing required fields: name, productId, specificationId.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...body,
            createdBy: user.username,
            createdAt: new Date().toISOString(),
            status: 'PROVISIONING', // Initial status
        };
        
        const result = await db.collection(COLLECTION_NAME).insertOne(newItem as any);
        const finalItem = { ...newItem, _id: result.insertedId };

        return NextResponse.json(finalItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
