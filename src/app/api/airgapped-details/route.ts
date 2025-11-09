import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const AirgappedDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const initialAirgappedDetails = [
    { "id": "Airgapped_Details_1", "name": "Airgapped Details 1", "description": "Details for standard airgapped setup." },
    { "id": "Airgapped_Details_2", "name": "Airgapped Details 2", "description": "Details for high-security airgapped systems." }
];

async function seedAirgappedDetails() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('airgapped_details');
    
    await collection.deleteMany({});
    await collection.insertMany(initialAirgappedDetails as any);
    console.log('Cleared and re-seeded airgapped_details collection.');

  } catch (error) {
    console.error('Error seeding airgapped_details:', error);
  }
}

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('airgapped_details');
    
    const count = await collection.countDocuments();
    if (count === 0) {
        await seedAirgappedDetails();
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
        const validatedData = AirgappedDetailsSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('airgapped_details');
        
        const result = await collection.insertOne(validatedData.data as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };


        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
