
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const COLLECTION_NAME = 'app_catalog';

// List all items
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const items = await db.collection(COLLECTION_NAME).find({}).sort({ name: 1 }).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
