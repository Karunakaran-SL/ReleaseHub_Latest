
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const initialWorkflows = [
    { "_id": "Workflow_Flow_1", "id": "Workflow_Flow_1", "name": "Flow 1", "description": "Standard linear workflow." },
    { "_id": "Workflow_Flow_2", "id": "Workflow_Flow_2", "name": "Flow 2", "description": "Workflow with parallel approval steps." },
    { "_id": "Workflow_Security_Review", "id": "Workflow_Security_Review", "name": "Security Review", "description": "Mandatory security review for sensitive products." }
];


async function seedWorkflows() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('workflows');
    
    for (const item of initialWorkflows) {
        await collection.updateOne(
            { _id: item._id },
            { $set: item },
            { upsert: true }
        );
    }
    console.log('Seeded workflows collection.');

  } catch (error) {
    console.error('Error seeding workflows:', error);
  }
}

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('workflows');
    
    const count = await collection.countDocuments();
    if (count === 0) {
        await seedWorkflows();
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
        const validatedData = WorkflowSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('workflows');
        
        const newItem = {
            _id: validatedData.data.id,
            ...validatedData.data
        };
        
        await collection.insertOne(newItem as any);


        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
