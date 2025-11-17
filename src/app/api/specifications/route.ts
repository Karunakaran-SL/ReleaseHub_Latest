

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';

const RefSchema = z.object({ id: z.string(), name: z.string() }).optional();
const CustomFieldSchema = z.object({ key: z.string(), value: z.string() }).optional();
const BladeSchema = z.object({
  name: z.string(),
  cpuType: z.string(),
  memoryPerBlade: z.number(),
  storageCapacity: z.number(),
}).optional();

const SpecificationSchema = z.object({
  name: z.string(),
  hw_type: RefSchema,
  vendor: z.string().optional(),
  total_cpu: z.number().optional(),
  memory_gb: z.number().optional(),
  storage_gb: z.number().optional(),
  hypervisor: RefSchema,
  image: z.string().url().optional(),
  service_contract_type: RefSchema,
  contact_point_email: z.string().email().optional().nullable(),
  contact_point_phone: z.string().optional().nullable(),
  network_cards: z.array(RefSchema).optional(),
  plug_power_cords: z.array(RefSchema).optional(),
  custom_fields: z.array(CustomFieldSchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // For blade servers
  symmetric: z.boolean().optional(),
  bladeCount: z.number().optional(),
  cpuType: z.string().optional(),
  memoryPerBlade: z.number().optional(),
  blades: z.array(BladeSchema).optional(),
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
            console.error(validatedData.error.flatten().fieldErrors);
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
