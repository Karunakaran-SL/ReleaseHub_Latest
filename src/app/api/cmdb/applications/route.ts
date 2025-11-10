
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { revalidateDependencyTree } from '@/lib/dependency-graph';

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

const tenantNames = [
    "Tenant_Shared_Services", "Tenant_App_Platform", "Tenant_Data_Infra", "Tenant_ML_Platform", "Tenant_Retail_Core",
    "Tenant_ECommerce_Frontend", "Tenant_Finance_Analytics", "Tenant_Marketing_Tools", "Tenant_IoT_Edge", "Tenant_Gaming_Services"
];

const interfacePool = [
    { id: "Interface_WebApp_UI", name: "WebApp UI" }, { id: "Interface_Public_API_Gateway", name: "Public API Gateway" },
    { id: "Interface_Internal_GraphQL", name: "Internal GraphQL API" }, { id: "Interface_Data_Ingestion", name: "Data Ingestion API" },
    { id: "Interface_Data_Query", name: "Data Query API" }, { id: "Interface_Model_Training", name: "Model Training API" },
    { id: "Interface_Model_Inference", name: "Model Inference API" }, { id: "Interface_Device_Telemetry", name: "Device Telemetry API" },
    { id: "Interface_Game_State", name: "Game State API" }, { id: "Interface_Leaderboard", name: "Leaderboard API" }
];

let appCounter = 0;
const createApp = (name: string, tenantId: string, provided: number[], required: number[], depComp: string) => {
    appCounter++;
    return {
        "_id": `App_${name.replace(/\s/g, '')}`, "id": `App_${name.replace(/\s/g, '')}`, "name": name, "version": `1.${appCounter}.0`,
        "tenants": [{ "id": tenantId, "name": tenantId.replace(/_/g, ' ') }],
        "provided_interfaces": provided.map(i => interfacePool[i]),
        "dependent_interfaces": required.map(i => interfacePool[i]),
        "dependent_components": [{ id: `Comp_Monitoring-${tenantId.slice(7)}`, name: `Monitoring-${tenantId.slice(7)}` }],
        "dependent_applications": [],
        "created_at": new Date().toISOString(), "updated_at": new Date().toISOString(), "phases": []
    };
};

const initialApplications: any[] = [];
tenantNames.forEach(tenantId => {
    const suffix = tenantId.slice(7);
    initialApplications.push(createApp(`Dashboard-${suffix}`, tenantId, [0], [1, 2], `Comp_Logging-${suffix}`));
    initialApplications.push(createApp(`APIGateway-${suffix}`, tenantId, [1], [3], `Comp_Security-${suffix}`));
    initialApplications.push(createApp(`DataProcessor-${suffix}`, tenantId, [4], [3], `Comp_Monitoring-${suffix}`));
    initialApplications.push(createApp(`ReportingSvc-${suffix}`, tenantId, [], [4], `Comp_Logging-${suffix}`));
    initialApplications.push(createApp(`Orchestrator-${suffix}`, tenantId, [], [1,4], `Comp_Security-${suffix}`));
});


async function seedApplications() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.deleteMany({_id: {$in: initialApplications.map(a => a._id)}});
    await collection.insertMany(initialApplications);

    console.log('Seeded applications collection.');

  } catch (error) {
    console.error('Error seeding applications:', error);
  }
}

// List all applications
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    await seedApplications();
    
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
        
        const products = await db.collection('products').find({}).toArray();
        for (const product of products) {
            revalidateDependencyTree(product._id);
        }

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
