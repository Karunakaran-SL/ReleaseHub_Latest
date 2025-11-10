
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
});

const COLLECTION_NAME = 'cmdb_components';

const tenantNames = [
    "Tenant_Shared_Services", "Tenant_App_Platform", "Tenant_Data_Infra", "Tenant_ML_Platform", "Tenant_Retail_Core",
    "Tenant_ECommerce_Frontend", "Tenant_Finance_Analytics", "Tenant_Marketing_Tools", "Tenant_IoT_Edge", "Tenant_Gaming_Services"
];

// Simplified data for relationships
const interfacePool = [
    { id: "Interface_Metrics_API", name: "Metrics API" }, { id: "Interface_Tracing_API", name: "Tracing API" }, { id: "Interface_Logging_API", name: "Logging API" },
    { id: "Interface_AuthN_API", name: "AuthN API" }, { id: "Interface_AuthZ_API", name: "AuthZ API" }, { id: "Interface_Discovery_API", name: "Discovery API" },
    { id: "Interface_Storage_S3", name: "S3 Storage API" }, { id: "Interface_SQL_DB", name: "SQL Database API" }, { id: "Interface_NoSQL_DB", name: "NoSQL Database API" },
    { id: "Interface_Streaming_Kafka", name: "Kafka Streaming API" }, { id: "Interface_Orchestration_API", name: "Orchestration API" }, { id: "Interface_Git_API", name: "Git API" }
];

let componentCounter = 0;
const createComponent = (name: string, tenantId: string, provided: number[], required: number[]) => {
    componentCounter++;
    return {
        "_id": `Comp_${name.replace(/\s/g, '')}`, "id": `Comp_${name.replace(/\s/g, '')}`, "name": name, "version": `1.${componentCounter}.0`,
        "tenants": [{ "id": tenantId, "name": tenantId.replace(/_/g, ' ') }],
        "provided_interfaces": provided.map(i => interfacePool[i]),
        "dependent_interfaces": required.map(i => interfacePool[i]),
        "dependent_components": [],
        "created_at": new Date().toISOString(), "updated_at": new Date().toISOString(), "phases": []
    };
};

const initialComponents: any[] = [];
tenantNames.forEach(tenantId => {
    initialComponents.push(createComponent(`Monitoring-${tenantId.slice(7)}`, tenantId, [0], [1, 2]));
    initialComponents.push(createComponent(`Logging-${tenantId.slice(7)}`, tenantId, [2], [10]));
    initialComponents.push(createComponent(`Security-${tenantId.slice(7)}`, tenantId, [3, 4], [5]));
});


async function seedComponents() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.deleteMany({_id: {$in: initialComponents.map(c => c._id)}});
    await collection.insertMany(initialComponents);

    console.log('Seeded components collection.');
  } catch (error) {
    console.error('Error seeding components:', error);
  }
}

// List all components
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    await seedComponents();
    
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
        
        const newItem = {
            _id: validatedData.data.id,
            ...validatedData.data,
        };

        await db.collection(COLLECTION_NAME).insertOne(newItem as any);

        await logAuditEvent({
            action: 'CREATE',
            entity: 'component',
            entityId: newItem.id,
            comment: `Component "${newItem.name}" onboarded.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
