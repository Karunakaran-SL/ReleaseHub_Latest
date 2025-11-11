
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';

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

const ApplicationSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  tenants: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  version: z.string().min(1, 'Version is required'),
  artifact_location: z.string().optional(),
  artifact_name: z.string().optional(),
  resources: z.object({
    default_instances: z.number().optional(),
    cpu: z.number().optional(),
    memory: z.number().optional(),
    storage: z.number().optional(),
  }).optional(),
  custom_labels: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  provided_interfaces: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  dependent_interfaces: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  dependent_components: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  dependent_applications: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  phases: z.array(CmdbPhaseSchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  description: z.string().optional(),
});

const COLLECTION_NAME = 'cmdb_applications';

// List all applications
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

// Create a new application
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = ApplicationSchema.safeParse(body);

        if (!validatedData.success) {
            console.error(validatedData.error.flatten().fieldErrors);
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...validatedData.data,
            _id: validatedData.data.id,
        };
        
        await db.collection(COLLECTION_NAME).insertOne(newItem as any);

        await logAuditEvent({
            action: 'CREATE',
            entity: 'application',
            entityId: newItem.id,
            comment: `Application "${newItem.name}" onboarded.`,
        });
        
        await generateAndStoreAllProductTrees();

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
