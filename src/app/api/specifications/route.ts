

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';

const SpecificationSchema = z.object({
  name: z.string(),
  hw_type: z.object({ id: z.string(), name: z.string() }),
  vendor: z.string(),
  total_cpu: z.number(),
  memory_gb: z.number(),
  storage_gb: z.number(),
  hypervisor: z.object({ id: z.string(), name: z.string() }),
  image: z.string().url(),
  service_contract_type: z.object({ id: z.string(), name: z.string() }),
  contact_point_email: z.string().email(),
  contact_point_phone: z.string(),
  network_cards: z.array(z.object({ id: z.string(), name: z.string() })),
  plug_power_cords: z.array(z.object({ id: z.string(), name: z.string() })),
  custom_fields: z.array(z.object({ key: z.string(), value: z.string() })),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const items = await db.collection('specifications').find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new item
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await req.json();
        const validatedData = SpecificationSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('specifications');
        
        const newItem = {
            ...validatedData.data,
            _id: validatedData.data.name.replace(/[^a-zA-Z0-9]/g, ''),
        };

        const existing = await collection.findOne({ _id: newItem._id });
        if (existing) {
             return NextResponse.json({ message: `Specification with ID "${newItem._id}" already exists.` }, { status: 409 });
        }
        
        await collection.insertOne(newItem as any);
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'specification',
            entityId: newItem._id,
            comment: `Specification "${newItem.name}" created.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
