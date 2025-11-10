
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

const initialApplicationOnboardingPhases = [
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
    return initialApplicationOnboardingPhases.map(p => ({
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

const initialApplications = [
    {
        "id": "App_Ecom_Storefront", "name": "E-Commerce Storefront", "description": "Customer-facing web application for browsing and purchasing products.", "version": "2.1.0",
        "tenants": [{ "id": "Tenant_High_Level", "name": "High Level Services" }],
        "dependent_components": [{ "id": "Comp_Auth_Service", "name": "Authentication Service" }, { "id": "Comp_Search_Service", "name": "Search Service" }],
        "dependent_applications": [{ "id": "App_Order_Processing", "name": "Order Processing Backend" }],
        "provided_interfaces": [{ "id": "Interface_Web_UI", "name": "Main Web UI" }],
        "dependent_interfaces": [{ "id": "Interface_Product_Catalog_API", "name": "Product Catalog API" }, { "id": "Interface_User_Auth_API", "name": "User Authentication API" }],
        "created_at": "2024-01-15T10:00:00Z", "updated_at": "2024-01-15T10:00:00Z", "phases": generatePhases()
    },
    {
        "id": "App_Order_Processing", "name": "Order Processing Backend", "description": "Handles order creation, payment processing, and fulfillment.", "version": "1.5.0",
        "tenants": [ { "id": "Tenant_Medium_Level", "name": "Medium Level Services" } ],
        "dependent_components": [{ "id": "Comp_Payment_Gateway", "name": "Payment Gateway" }, { "id": "Comp_Inventory_Service", "name": "Inventory Service" }],
        "provided_interfaces": [{ "id": "Interface_Order_API", "name": "Order Management API" }],
        "dependent_interfaces": [{ "id": "Interface_Payment_API", "name": "Payment Processing API" }],
        "created_at": "2024-01-16T11:00:00Z", "updated_at": "2024-01-16T11:00:00Z", "phases": generatePhases()
    },
    {
        "id": "App_Analytics_Dashboard", "name": "Analytics Dashboard", "description": "Provides business intelligence and sales analytics.", "version": "3.0.0",
        "tenants": [{ "id": "Tenant_Analytics", "name": "Analytics" }],
        "dependent_components": [{ "id": "Comp_Data_Warehouse_Connector", "name": "Data Warehouse Connector" }],
        "provided_interfaces": [{ "id": "Interface_Analytics_UI", "name": "Analytics Web UI" }],
        "dependent_interfaces": [{ "id": "Interface_Reporting_API", "name": "Reporting API" }],
        "created_at": "2024-02-10T09:00:00Z", "updated_at": "2024-02-10T09:00:00Z", "phases": generatePhases()
    }
];

async function seedApplications() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    for (const app of initialApplications) {
        await collection.updateOne(
            { _id: app.id },
            { $set: { ...app, _id: app.id, updated_at: new Date().toISOString() }, $setOnInsert: { created_at: new Date().toISOString() } },
            { upsert: true }
        );
    }
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
