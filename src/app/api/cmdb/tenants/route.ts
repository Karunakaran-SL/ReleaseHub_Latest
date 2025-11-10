
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
    { "id": "Tenant_Platform_Foundation", "name": "Platform Foundation", "products": [{ "id": "Product_OSS_Portal", "name": "OneStopShop Portal" }, { "id": "Product_Data_Fabric", "name": "Unified Data Fabric" }], "dependent_tenants": [] },
    { "id": "Tenant_Retail_Services", "name": "Retail Services", "products": [{ "id": "Product_OSS_Portal", "name": "OneStopShop Portal" }], "dependent_tenants": [{ "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }] },
    { "id": "Tenant_Data_Analytics", "name": "Data & Analytics", "products": [{ "id": "Product_Data_Fabric", "name": "Unified Data Fabric" }, { "id": "Product_ML_Platform", "name": "AI/ML Workbench" }], "dependent_tenants": [{ "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }] },
    { "id": "Tenant_AI_Research", "name": "AI Research", "products": [{ "id": "Product_ML_Platform", "name": "AI/ML Workbench" }], "dependent_tenants": [{ "id": "Tenant_Data_Analytics", "name": "Data & Analytics" }] },
    { "id": "Tenant_IoT_Core", "name": "IoT Core", "products": [{ "id": "Product_Edge_Orchestrator", "name": "Edge Computing Orchestrator" }], "dependent_tenants": [] },
    { "id": "Tenant_Cybersecurity", "name": "Cybersecurity Ops", "products": [{ "id": "Product_Security_Fabric", "name": "Zero-Trust Security Fabric" }], "dependent_tenants": [] },
    { "id": "Tenant_Shared_Services", "name": "Shared Services", "products": [{ "id": "Product_OSS_Portal", "name": "OneStopShop Portal" }, { "id": "Product_Security_Fabric", "name": "Zero-Trust Security Fabric" }], "dependent_tenants": [] },
    { "id": "Tenant_Gaming_Platform", "name": "Gaming Platform", "products": [{ "id": "Product_OSS_Portal", "name": "OneStopShop Portal" }], "dependent_tenants": [{ "id": "Tenant_Shared_Services", "name": "Shared Services" }] },
    { "id": "Tenant_Fintech_Services", "name": "Fintech Services", "products": [{ "id": "Product_Data_Fabric", "name": "Unified Data Fabric" }], "dependent_tenants": [{ "id": "Tenant_Data_Analytics", "name": "Data & Analytics" }] },
    { "id": "Tenant_Marketing_Automation", "name": "Marketing Automation", "products": [{ "id": "Product_ML_Platform", "name": "AI/ML Workbench" }], "dependent_tenants": [{ "id": "Tenant_Data_Analytics", "name": "Data & Analytics" }] }
].map(t => ({
    ...t,
    _id: t.id,
    description: `Description for ${t.name}`,
    version: "1.0.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phases: []
}));


async function seedTenants() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.deleteMany({ _id: { $in: initialTenants.map(t => t._id) } });
    await collection.insertMany(initialTenants as any[]);
    
    console.log('Seeded tenants collection.');
  } catch (error) {
    console.error('Error seeding tenants:', error);
  }
}

// List all tenants
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await seedTenants();
    
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
        
        const newItem = {
            ...validatedData.data,
            _id: validatedData.data.id,
        };
        
        await db.collection(COLLECTION_NAME).insertOne(newItem as any);

        await logAuditEvent({
            action: 'CREATE',
            entity: 'tenant',
            entityId: validatedData.data.id,
            comment: `Tenant "${newItem.name}" onboarded.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
