

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

const initialComponentOnboardingPhases = [
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
    return initialComponentOnboardingPhases.map(p => ({
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

const initialComponents = [
    {
        "id": "Comp_Auth_Service", "name": "Authentication Service", "version": "1.2.0",
        "tenants": [{ "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }],
        "provided_interfaces": [{ "id": "Interface_User_Auth_API", "name": "User Authentication API" }],
        "created_at": "2024-01-10T09:00:00Z", "updated_at": "2024-01-10T09:00:00Z", "phases": generatePhases()
    },
    {
        "id": "Comp_Payment_Gateway", "name": "Payment Gateway", "version": "3.0.0",
        "tenants": [{ "id": "Tenant_Low_Level", "name": "Low Level Services" }],
        "provided_interfaces": [{ "id": "Interface_Payment_API", "name": "Payment Processing API" }],
        "dependent_interfaces": [{ "id": "Interface_Compliance_Check_API", "name": "Compliance Check API" }],
        "created_at": "2024-01-11T14:00:00Z", "updated_at": "2024-01-11T14:00:00Z", "phases": generatePhases()
    },
    {
        "id": "Comp_Inventory_Service", "name": "Inventory Service", "version": "2.5.0",
        "tenants": [{ "id": "Tenant_Medium_Level", "name": "Medium Level Services" }],
        "provided_interfaces": [{ "id": "Interface_Product_Catalog_API", "name": "Product Catalog API" }],
        "created_at": "2024-01-12T11:00:00Z", "updated_at": "2024-01-12T11:00:00Z", "phases": generatePhases()
    },
    {
        "id": "Comp_Search_Service", "name": "Search Service", "version": "1.8.0",
        "tenants": [{ "id": "Tenant_Platform_Infra", "name": "Platform Infra" }],
        "dependent_interfaces": [{ "id": "Interface_Product_Catalog_API", "name": "Product Catalog API" }],
        "created_at": "2024-01-13T16:00:00Z", "updated_at": "2024-01-13T16:00:00Z", "phases": generatePhases()
    },
    {
        "id": "Comp_Email_Service", "name": "Email Service", "version": "2.0.0",
        "tenants": [ { "id": "Tenant_Platform_Mediations", "name": "Platform Mediations" } ],
        "created_at": "2024-01-14T10:00:00Z", "updated_at": "2024-01-14T10:00:00Z", "phases": generatePhases()
    }
];


async function seedComponents() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    for (const component of initialComponents) {
        await collection.updateOne(
            { id: component.id },
            { $set: { ...component, updated_at: new Date().toISOString() }, $setOnInsert: { created_at: new Date().toISOString() } },
            { upsert: true }
        );
    }
    console.log('Seeded components collection.');

  } catch (error) {
    console.error('Error seeding components:', error);
  }
}

// List all components
export async function GET(req: NextRequest) {
  try {
    await seedComponents();
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
        });

        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
