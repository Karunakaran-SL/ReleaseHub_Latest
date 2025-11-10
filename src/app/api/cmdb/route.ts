
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const CmdbSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const initialCmdb = [
    { "id": "CMDB_1", "name": "CMDB 1", "description": "Primary configuration database." },
    { "id": "CMDB_2", "name": "CMDB 2", "description": "Secondary configuration for analytics." },
    { "id": "CMDB_3", "name": "CMDB 3", "description": "HR systems configuration." }
];

async function seedCmdb() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('cmdb');
    
    // This will only delete the initial seed items, preserving user-added data
    await collection.deleteMany({ id: { $in: initialCmdb.map(i => i.id) } });
    await collection.insertMany(initialCmdb as any);
    console.log('Seeded cmdb collection.');

  } catch (error) {
    console.error('Error seeding cmdb:', error);
  }
}

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('cmdb');
    
    const count = await collection.countDocuments();
    if (count === 0) {
        await seedCmdb();
    }

    const items = await collection.find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new item
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = CmdbSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('cmdb');
        
        const result = await collection.insertOne(validatedData.data as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };


        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
