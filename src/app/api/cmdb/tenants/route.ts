

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const OnboardingFieldProofSchema = z.object({
  link: z.string().optional(),
}).optional();

const OnboardingFieldSchema = z.object({
  name: z.string(),
  value: z.any(),
  proof: OnboardingFieldProofSchema,
});

const TenantPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.string(),
  fields: z.array(OnboardingFieldSchema),
});


const TenantSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  version: z.string().optional(),
  artifact_location: z.string().optional(),
  dependent_tenants: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  products: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  resources: z.object({
      cpu: z.number().optional(),
      memory_gb: z.number().optional(),
      storage_gb: z.number().optional(),
  }).optional(),
  phases: z.array(TenantPhaseSchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const COLLECTION_NAME = 'cmdb_tenants';

const initialTenants = [
    { "id": "Tenant_Platform_Foundation", "name": "Platform Foundation", "description": "Core platform services and infrastructure foundation.", "products": [], "dependent_tenants": [], "version": "1.0.0", "created_at": "2023-12-01T10:00:00Z", "updated_at": "2023-12-01T10:00:00Z" },
    { "id": "Tenant_Platform_Infra", "name": "Platform Infra", "description": "Infrastructure services for compute, storage, and networking.", "products": [], "dependent_tenants": [{ "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }], "version": "1.1.0", "created_at": "2023-12-01T11:00:00Z", "updated_at": "2023-12-01T11:00:00Z" },
    { "id": "Tenant_Platform_Mediations", "name": "Platform Mediations", "description": "Integration and mediation services for connecting systems.", "products": [], "dependent_tenants": [{ "id": "Tenant_Platform_Infra", "name": "Platform Infra" }], "version": "1.2.0", "created_at": "2023-12-01T12:00:00Z", "updated_at": "2023-12-01T12:00:00Z" },
    { "id": "Tenant_Analytics", "name": "Analytics", "description": "Data analytics and business intelligence services.", "products": [], "dependent_tenants": [{ "id": "Tenant_Platform_Infra", "name": "Platform Infra" }], "version": "2.0.0", "created_at": "2023-12-02T09:00:00Z", "updated_at": "2023-12-02T09:00:00Z" },
    { "id": "Tenant_Low_Level", "name": "Low Level Services", "description": "Fundamental services for e-commerce operations.", "products": [], "dependent_tenants": [{ "id": "Tenant_Platform_Mediations", "name": "Platform Mediations" }], "version": "1.0.0", "created_at": "2023-12-02T10:00:00Z", "updated_at": "2023-12-02T10:00:00Z" },
    { "id": "Tenant_Medium_Level", "name": "Medium Level Services", "description": "Business logic and orchestration for e-commerce.", "products": [], "dependent_tenants": [{ "id": "Tenant_Low_Level", "name": "Low Level Services" }], "version": "1.0.0", "created_at": "2023-12-02T11:00:00Z", "updated_at": "2023-12-02T11:00:00Z" },
    { "id": "Tenant_High_Level", "name": "High Level Services", "description": "Customer-facing e-commerce applications and APIs.", "products": [], "dependent_tenants": [{ "id": "Tenant_Medium_Level", "name": "Medium Level Services" }], "version": "1.0.0", "created_at": "2023-12-02T12:00:00Z", "updated_at": "2023-12-02T12:00:00Z" }
];


async function seedTenants() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    // This will only delete the initial seed items, preserving user-added data
    await collection.deleteMany({ id: { $in: initialTenants.map(i => i.id) } });
    await collection.insertMany(initialTenants as any);
    console.log('Seeded tenants collection.');

  } catch (error) {
    console.error('Error seeding tenants:', error);
  }
}

// List all tenants
export async function GET(req: NextRequest) {
  try {
    await seedTenants();
    const client = await clientPromise;
    const db = client.db();
    
    const items = await db.collection(COLLECTION_NAME).find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new tenant
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = TenantSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const result = await db.collection(COLLECTION_NAME).insertOne(validatedData.data as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };

        await logAuditEvent({
            action: 'CREATE',
            entity: 'tenant',
            entityId: result.insertedId.toString(),
            comment: `Tenant "${insertedItem.name}" onboarded.`,
        });

        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
