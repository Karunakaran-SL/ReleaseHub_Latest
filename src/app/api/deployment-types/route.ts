
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const DeploymentTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const initialDeploymentTypes = [
    { "_id": "Deployment_Airgapped", "id": "Deployment_Airgapped", "name": "Airgapped", "description": "Deployment in an isolated, offline environment." },
    { "_id": "Deployment_Cloud", "id": "Deployment_Cloud", "name": "Cloud", "description": "Deployment to a public or private cloud." },
    { "_id": "Deployment_OnPrem", "id": "Deployment_OnPrem", "name": "On-Prem", "description": "Deployment to on-premises servers." }
];

async function seedDeploymentTypes() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('deployment_types');
    
    for (const item of initialDeploymentTypes) {
        await collection.updateOne(
            { _id: item._id },
            { $set: item },
            { upsert: true }
        );
    }
    console.log('Seeded deployment_types collection.');

  } catch (error) {
    console.error('Error seeding deployment_types:', error);
  }
}

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('deployment_types');
    
    const count = await collection.countDocuments();
    if (count === 0) {
        await seedDeploymentTypes();
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
        const validatedData = DeploymentTypeSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('deployment_types');
        
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
