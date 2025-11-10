
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

const initialTenantOnboardingPhases = [
    { id: "phase-1", name: "Initiate Onboarding", fields: ["requestFormSubmitted", "csApproved", "pmApproved", "productTeamAgreement"] },
    { id: "phase-2", name: "Product Definitions", fields: ["architectAgreed", "specChanged", "hlDesignApproved"] },
    { id: "phase-3", name: "Detail Design", fields: ["detailDesignDone", "dependencyIdentified", "pertReady", "testPlanReady"] },
    { id: "phase-4", name: "Delivery", fields: ["implementationDone", "unitTestDone", "staticCodeDone", "systemIntegrationDone", "systemIntegrationTestingDone", "allTestCasesAutomated"] },
    { id: "phase-5", name: "Alpha Qualification", fields: ["uatTestDone", "riskReported", "serviceMetricsDone"] },
    { id: "phase-6", name: "Prepare customer", fields: ["communicatedChanges", "plannedMCWindow"] },
    { id: "phase-7", name: "Beta Qualification", fields: ["deploymentRunbookForBeta", "deploymentDone", "betaTestsExecuted"] },
    { id: "phase-8", name: "Completed", fields: ["onboardingCompleteClosure"] }
];
const statuses = ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"];
const getRandomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];

const generatePhases = () => {
    return initialTenantOnboardingPhases.map(p => ({
        id: p.id,
        name: p.name,
        version: "1.0",
        status: getRandomStatus(),
        fields: p.fields.map(f => ({
            name: f,
            value: Math.random() > 0.5,
            proof: { link: '' }
        }))
    }));
};

const initialTenants = [
    { "id": "Tenant_Shared_Services", "name": "Shared Services", "products": [{ "id": "Product_Observability_Platform", "name": "Cloud-Native Observability Platform" }], "dependent_tenants": [] },
    { "id": "Tenant_App_Platform", "name": "Application Platform", "products": [{ "id": "Product_Developer_Hub", "name": "Internal Developer Hub" }], "dependent_tenants": [{ "id": "Tenant_Shared_Services", "name": "Shared Services" }] },
    { "id": "Tenant_Data_Infra", "name": "Data Infrastructure", "products": [{ "id": "Product_Data_Analytics_Suite", "name": "Data & Analytics Suite" }], "dependent_tenants": [{ "id": "Tenant_Shared_Services", "name": "Shared Services" }] },
    { "id": "Tenant_ML_Platform", "name": "ML Platform", "products": [{ "id": "Product_AI_ML_Workbench", "name": "AI/ML Workbench" }], "dependent_tenants": [{ "id": "Tenant_Data_Infra", "name": "Data Infrastructure" }] },
    { "id": "Tenant_Retail_Core", "name": "Retail Core Services", "products": [{ "id": "Product_Developer_Hub", "name": "Internal Developer Hub" }], "dependent_tenants": [{ "id": "Tenant_App_Platform", "name": "Application Platform" }] },
    { "id": "Tenant_ECommerce_Frontend", "name": "E-Commerce Frontend", "products": [{ "id": "Product_Observability_Platform", "name": "Cloud-Native Observability Platform" }, { "id": "Product_Developer_Hub", "name": "Internal Developer Hub" }], "dependent_tenants": [{ "id": "Tenant_Retail_Core", "name": "Retail Core Services" }] },
    { "id": "Tenant_Finance_Analytics", "name": "Finance & Analytics", "products": [{ "id": "Product_Data_Analytics_Suite", "name": "Data & Analytics Suite" }], "dependent_tenants": [{ "id": "Tenant_Data_Infra", "name": "Data Infrastructure" }] },
    { "id": "Tenant_Marketing_Tools", "name": "Marketing Tools", "products": [{ "id": "Product_Developer_Hub", "name": "Internal Developer Hub" }], "dependent_tenants": [{ "id": "Tenant_App_Platform", "name": "Application Platform" }] },
    { "id": "Tenant_IoT_Edge", "name": "IoT Edge Platform", "products": [{ "id": "Product_Edge_Computing_Fabric", "name": "Edge Computing Fabric" }], "dependent_tenants": [] },
    { "id": "Tenant_Gaming_Services", "name": "Online Gaming Services", "products": [{ "id": "Product_Observability_Platform", "name": "Cloud-Native Observability Platform" }], "dependent_tenants": [{ "id": "Tenant_App_Platform", "name": "Application Platform" }] }
].map(t => ({
    ...t,
    _id: t.id,
    description: `Description for ${t.name}`,
    version: "1.0.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phases: generatePhases()
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
    
    const items = await collection.find({}).toArray();
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
            _id: validatedData.data.id,
            ...validatedData.data
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
