
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const InterfaceTypeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const COLLECTION_NAME = 'cmdb_interface_types';

const initialTypes = [
    { id: "Interface_Type_API", name: "API", description: "A standard API endpoint." },
    { id: "Interface_Type_Topic", name: "Topic", description: "A message queue topic." },
    { id: "Interface_Type_UI", name: "UI", description: "A user interface component." },
];

async function seedInterfaceTypes() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    // This will only delete the initial seed items, preserving user-added data
    await collection.deleteMany({ id: { $in: initialTypes.map(i => i.id) } });
    await collection.insertMany(initialTypes as any);
    console.log('Seeded interface types collection.');

  } catch (error) {
    console.error('Error seeding interface types:', error);
  }
}

// List all interface types
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const count = await collection.countDocuments();
    if (count === 0) {
        await seedInterfaceTypes();
    }
    
    const items = await db.collection(COLLECTION_NAME).find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new interface type
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = InterfaceTypeSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const result = await db.collection(COLLECTION_NAME).insertOne(validatedData.data as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };

        await logAuditEvent({
            action: 'CREATE',
            entity: 'interface_type',
            entityId: result.insertedId.toString(),
            comment: `Interface Type "${insertedItem.name}" created.`,
        });

        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
