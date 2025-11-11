
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

const initialApplications = [
    // Apps for Tenant_Platform_Foundation
    { id: "App_UserDashboard", name: "User Dashboard", version: "2.0.0", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [{id: "Comp_AuthService", name: "Authentication Service"}, {id: "Comp_SearchService", name: "Search Service"}], dependent_applications: [{id: "App_AdminConsole", name: "Admin Console"}], dependent_interfaces: [{id: "Interface_AuthService", name: "Auth Service Interface"}], provided_interfaces: [{id: "Interface_UserDashboardAPI", name: "User Dashboard API"}] },
    { id: "App_AdminConsole", name: "Admin Console", version: "1.1.0", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [], dependent_applications: [], dependent_interfaces: [{id: "Interface_UserDashboardAPI", name: "User Dashboard API"}], provided_interfaces: [{id: "Interface_AdminAPI", name: "Admin API"}] },
    { id: "App_MetricsExporter", name: "Metrics Exporter", version: "1.0.0", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [], dependent_applications: [], dependent_interfaces: [{id: "Interface_Prometheus", name: "Prometheus Endpoint"}], provided_interfaces: [] },
    { id: "App_BillingProcessor", name: "Billing Processor", version: "1.2.0", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [], dependent_applications: [], dependent_interfaces: [{id: "Interface_PaymentGateway", name: "Payment Gateway API"}], provided_interfaces: [] },
    { id: "App_NotificationService", name: "Notification Service", version: "1.0.0", tenants: [{ id: "Tenant_Platform_Foundation", name: "Platform Foundation" }], dependent_components: [], dependent_applications: [], dependent_interfaces: [{id: "Interface_SendGrid", name: "SendGrid API"}], provided_interfaces: [] },

    // Apps for Tenant_Retail_Services
    { id: "App_ShoppingCart", name: "Shopping Cart", version: "2.5.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [{id: "Comp_OrderProcessor", name: "Order Processor"}], dependent_applications: [], dependent_interfaces: [], provided_interfaces: [] },
    { id: "App_ProductRecs", name: "Product Recommendations", version: "1.8.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [], dependent_applications: [], dependent_interfaces: [], provided_interfaces: [] },
    { id: "App_CheckoutSvc", name: "Checkout Service", version: "3.0.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [{id: "Comp_OrderProcessor", name: "Order Processor"}], dependent_applications: [], dependent_interfaces: [], provided_interfaces: [] },
    { id: "App_CustomerReviews", name: "Customer Reviews", version: "1.2.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [], dependent_applications: [], dependent_interfaces: [], provided_interfaces: [] },
    { id: "App_StoreLocator", name: "Store Locator", version: "1.0.0", tenants: [{ id: "Tenant_Retail_Services", name: "Retail Services" }], dependent_components: [], dependent_applications: [], dependent_interfaces: [], provided_interfaces: [] },
].map(a => ({
    ...a,
    _id: a.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phases: generatePhases()
}));

// Function to add more applications if needed
function populateApplications() {
    const appCountByTenant = initialApplications.reduce((acc, curr) => {
        curr.tenants.forEach(t => {
            acc[t.id] = (acc[t.id] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    tenantIds.forEach(tenantId => {
        let currentCount = appCountByTenant[tenantId] || 0;
        while (currentCount < 5) {
            const newIndex = initialApplications.length + 1;
            const newApp = {
                id: `App_Generated_${tenantId}_${newIndex}`,
                _id: `App_Generated_${tenantId}_${newIndex}`,
                name: `Generated App ${newIndex}`,
                version: '1.0.0',
                tenants: [{ id: tenantId, name: tenantId.replace(/_/g, ' ') }],
                dependent_components: [],
                dependent_applications: [],
                dependent_interfaces: [],
                provided_interfaces: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                phases: generatePhases()
            };
            initialApplications.push(newApp);
            currentCount++;
        }
    });
}
populateApplications();


async function seedApplications() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.insertMany(initialApplications as any);

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
    const collection = db.collection(COLLECTION_NAME);

    const count = await collection.countDocuments();
    if (count === 0) {
        await seedApplications();
    }
    
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
