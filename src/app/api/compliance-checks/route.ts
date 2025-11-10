
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const ComplianceCheckSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const initialComplianceChecks = [
    { "_id": "Compliance_Security", "id": "Compliance_Security", "name": "Security", "description": "Full security audit." },
    { "_id": "Compliance_IT_Policy", "id": "Compliance_IT_Policy", "name": "IT Policy", "description": "Adherence to internal IT policies." }
];

async function seedComplianceChecks() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('compliance_checks');
    
    for (const item of initialComplianceChecks) {
        await collection.updateOne(
            { _id: item._id },
            { $set: item },
            { upsert: true }
        );
    }
    console.log('Seeded compliance_checks collection.');

  } catch (error) {
    console.error('Error seeding compliance_checks:', error);
  }
}

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('compliance_checks');
    
    const count = await collection.countDocuments();
    if (count === 0) {
        await seedComplianceChecks();
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
        const validatedData = ComplianceCheckSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('compliance_checks');
        
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
