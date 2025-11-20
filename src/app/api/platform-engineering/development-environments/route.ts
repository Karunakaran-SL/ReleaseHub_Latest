
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';
import { z } from 'zod';

const COLLECTION_NAME = 'development_environments';

const CreateSchema = z.object({
  name: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().optional(),
  specificationId: z.string().min(1),
  specName: z.string().optional(),
  baselineId: z.string().optional(),
  tenantIds: z.array(z.string()).optional(),
  dependencySummary: z.array(z.any()).optional(),
  estimatedCost: z.number().optional(),
  resourceUsage: z.any().optional(),
});


// List all development environments
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

// Create a new development environment
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        const validatedData = CreateSchema.safeParse(body);
        if (!validatedData.success) {
            console.error(validatedData.error);
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }


        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...validatedData.data,
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
