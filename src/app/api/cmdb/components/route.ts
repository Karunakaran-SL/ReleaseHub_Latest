
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

const tenantIds = [
    "Tenant_Platform_Foundation", "Tenant_Retail_Services", "Tenant_Data_Analytics", "Tenant_AI_Research", "Tenant_IoT_Core",
    "Tenant_Cybersecurity", "Tenant_Shared_Services", "Tenant_Gaming_Platform", "Tenant_Fintech_Services", "Tenant_Marketing_Automation"
];

const onboardingConfigPhases = [
    { id: "phase-1", name: "Initiate Onboarding", fields: [ { name: "requestFormSubmitted" }, { name: "csApproved" }, { name: "pmApproved" }, { name: "productTeamAgreement" } ] },
    { id: "phase-2", name: "Product Definitions", fields: [ { name: "architectAgreed" }, { name: "specChanged" }, { name: "hlDesignApproved" } ] },
    { id: "phase-3", name: "Detail Design", fields: [ { name: "detailDesignDone" }, { name: "dependencyIdentified" }, { name: "pertReady" }, { name: "testPlanReady" } ] },
    { id: "phase-4", name: "Delivery", fields: [ { name: "implementationDone" }, { name: "unitTestDone" }, { name: "staticCodeDone" }, { name: "systemIntegrationDone" }, { name: "systemIntegrationTestingDone" }, { name: "allTestCasesAutomated" } ] },
    { id: "phase-5", name: "Alpha Qualification", fields: [ { name: "uatTestDone" }, { name: "riskReported" }, { name: "serviceMetricsDone" } ] },
    { id: "phase-6", name: "Prepare customer", fields: [ { name: "communicatedChanges" }, { name: "plannedMCWindow" } ] },
    { id: "phase-7", name: "Beta Qualification", fields: [ { name: "deploymentRunbookForBeta" }, { name: "deploymentDone" }, { name: "betaTestsExecuted" } ] },
    { id: "phase-8", name: "Completed", fields: [ { name: "onboardingCompleteClosure" } ] }
];

const generatePhases = () => {
    return onboardingConfigPhases.map(phase => ({
        id: phase.id,
        name: phase.name,
        version: "1.0",
        status: "Done",
        fields: phase.fields.map(field => ({
            name: field.name,
            value: true,
            proof: { link: "https://example.com/proof" }
        }))
    }));
};

const initialComponents = [
    // Components for Tenant_Platform_Foundation
    { id: "Comp_AuthService", name: "Authentication Service", version: "1.3.0", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [{ id: "Comp_UserProfile", name: "User Profile Service" }], dependent_applications: [{ id: "App_UserDashboard", name: "User Dashboard" }], provided_interfaces: [{ id: "Interface_AuthService", name: "Auth Service Interface" }], dependent_interfaces: [{ id: "Interface_LoginAPI", name: "Login API" }] },
    { id: "Comp_UserProfile", name: "User Profile Service", version: "1.2.1", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [], dependent_applications: [], provided_interfaces: [{ id: "Interface_UserProfileAPI", name: "User Profile API" }], dependent_interfaces: [{ id: "Interface_Database", name: "Database Interface" }] },
    { id: "Comp_LoggingService", name: "Centralized Logging", version: "2.1.0", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [], dependent_applications: [], provided_interfaces: [{ id: "Interface_LogQuery", name: "Log Query API" }], dependent_interfaces: [{ id: "Interface_Fluentd", name: "Fluentd Collector" }] },

    // Components for Tenant_Retail_Services
    { id: "Comp_OrderProcessor", name: "Order Processor", version: "1.5.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [{id: "Comp_InventoryMgmt", name: "Inventory Management"}], dependent_applications: [], provided_interfaces: [{ id: "Interface_OrderAPI", name: "Order API" }], dependent_interfaces: [{ id: "Interface_PaymentGateway", name: "Payment Gateway API" }] },
    { id: "Comp_InventoryMgmt", name: "Inventory Management", version: "2.0.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [], dependent_applications: [], provided_interfaces: [{ id: "Interface_InventoryAPI", name: "Inventory API" }], dependent_interfaces: [{ id: "Interface_Database", name: "Database Interface" }] },
    { id: "Comp_ProductCatalog", name: "Product Catalog", version: "3.1.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [], dependent_applications: [], provided_interfaces: [{ id: "Interface_CatalogAPI", name: "Catalog API" }], dependent_interfaces: [{ id: "Interface_Database", name: "Database Interface" }] },

    // ... and so on for other tenants, ensuring at least 3 unique components per tenant
].map(c => ({
    ...c,
    _id: c.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phases: generatePhases()
}));

// Function to add more components if needed to meet the requirements
function populateComponents() {
    const componentCountByTenant = initialComponents.reduce((acc, curr) => {
        curr.tenants.forEach(t => {
            acc[t.id] = (acc[t.id] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    tenantIds.forEach(tenantId => {
        let currentCount = componentCountByTenant[tenantId] || 0;
        while (currentCount < 3) {
            const newIndex = initialComponents.length + 1;
            initialComponents.push({
                id: `Comp_Generated_${tenantId}_${newIndex}`,
                _id: `Comp_Generated_${tenantId}_${newIndex}`,
                name: `Generated Component ${newIndex}`,
                version: '1.0.0',
                tenants: [{ id: tenantId, name: tenantId.replace(/_/g, ' ') }],
                dependent_components: [],
                dependent_applications: [],
                provided_interfaces: [{id: `Interface_Generic_Output_${newIndex}`, name: 'Generic Output'}, {id: `Interface_Second_Output_${newIndex}`, name: 'Second Output'}],
                dependent_interfaces: [{id: 'Interface_Generic_Input', name: 'Generic Input'}],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                phases: generatePhases()
            });
            currentCount++;
        }
    });
}
populateComponents();


async function seedComponents() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.deleteMany({_id: {$in: initialComponents.map(c => c._id)}});
    await collection.insertMany(initialComponents as any);

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
            ...validatedData.data,
            _id: validatedData.data.id,
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
