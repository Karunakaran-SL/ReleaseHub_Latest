
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const CmdbPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.string(),
  fields: z.array(z.object({
    name: z.string(),
    value: z.any(),
    proof: z.record(z.any()),
  })),
});

const ComponentSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['component', 'application']),
  tenants: z.array(z.object({ id: z.string(), name: z.string() })),
  version: z.string().min(1, 'Version is required'),
  artifact_location: z.string(),
  artifact_name: z.string(),
  resources: z.object({
    default_instances: z.number(),
    cpu: z.number(),
    memory: z.number(),
    storage: z.number(),
  }),
  custom_labels: z.array(z.object({ key: z.string(), value: z.string() })),
  provided_interfaces: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  dependent_interfaces: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  phases: z.array(CmdbPhaseSchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const COLLECTION_NAME = 'cmdb_components';

// List all components
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection(COLLECTION_NAME).find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new component
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = ComponentSchema.safeParse(body);

        if (!validatedData.success) {
            console.error(validatedData.error.flatten().fieldErrors);
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const result = await db.collection(COLLECTION_NAME).insertOne(validatedData.data as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };

        await logAuditEvent({
            action: 'CREATE',
            entity: 'component',
            entityId: result.insertedId.toString(),
            comment: `Component "${insertedItem.name}" onboarded.`,
            user: user.username,
        });

        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
