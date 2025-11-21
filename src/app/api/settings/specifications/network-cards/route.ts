
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const COLLECTION_NAME = 'specification_network_cards';

const CreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection(COLLECTION_NAME).find({}).sort({ name: 1 }).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = CreateSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json({ errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection(COLLECTION_NAME).insertOne(validatedData.data as any);
        const newItem = { ...validatedData.data, _id: result.insertedId };
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'spec_network_card',
            entityId: result.insertedId.toHexString(),
            comment: `Created Network Card "${newItem.name}".`,
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
