

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

const initialComponents = [
    {
        "id": "Comp_Auth_Service",
        "name": "Authentication Service",
        "version": "1.2.0",
        "tenants": [{ "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }],
        "provided_interfaces": [{ "id": "Interface_User_Auth_API", "name": "User Authentication API" }],
        "created_at": "2024-01-10T09:00:00Z", "updated_at": "2024-01-10T09:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Payment_Gateway",
        "name": "Payment Gateway",
        "version": "3.0.0",
        "tenants": [{ "id": "Tenant_Low_Level", "name": "Low Level Services" }],
        "provided_interfaces": [{ "id": "Interface_Payment_API", "name": "Payment Processing API" }],
        "dependent_interfaces": [{ "id": "Interface_Compliance_Check_API", "name": "Compliance Check API" }],
        "created_at": "2024-01-11T14:00:00Z", "updated_at": "2024-01-11T14:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Inventory_Service",
        "name": "Inventory Service",
        "version": "2.5.0",
        "tenants": [{ "id": "Tenant_Medium_Level", "name": "Medium Level Services" }],
        "provided_interfaces": [{ "id": "Interface_Product_Catalog_API", "name": "Product Catalog API" }],
        "created_at": "2024-01-12T11:00:00Z", "updated_at": "2024-01-12T11:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Search_Service",
        "name": "Search Service",
        "version": "1.8.0",
        "tenants": [{ "id": "Tenant_Platform_Infra", "name": "Platform Infra" }],
        "dependent_interfaces": [{ "id": "Interface_Product_Catalog_API", "name": "Product Catalog API" }],
        "created_at": "2024-01-13T16:00:00Z", "updated_at": "2024-01-13T16:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Email_Service",
        "name": "Email Service",
        "version": "2.0.0",
        "tenants": [
            { "id": "Tenant_Platform_Mediations", "name": "Platform Mediations" },
            { "id": "Tenant_Low_Level", "name": "Low Level Services" }
        ],
        "provided_interfaces": [],
        "created_at": "2024-01-14T10:00:00Z", "updated_at": "2024-01-14T10:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Data_Warehouse_Connector",
        "name": "Data Warehouse Connector",
        "version": "1.0.0",
        "tenants": [{ "id": "Tenant_Analytics", "name": "Analytics" }],
        "provided_interfaces": [{ "id": "Interface_Reporting_API", "name": "Reporting API" }],
        "created_at": "2024-02-01T12:00:00Z", "updated_at": "2024-02-01T12:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Config_Service",
        "name": "Configuration Service",
        "version": "1.5.0",
        "tenants": [{ "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }],
        "created_at": "2024-02-05T09:00:00Z", "updated_at": "2024-02-05T09:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Logging_Service",
        "name": "Logging Service",
        "version": "2.1.0",
        "tenants": [{ "id": "Tenant_Platform_Infra", "name": "Platform Infra" }],
        "created_at": "2024-02-06T10:00:00Z", "updated_at": "2024-02-06T10:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Message_Broker",
        "name": "Message Broker",
        "version": "3.0.0",
        "tenants": [{ "id": "Tenant_Platform_Mediations", "name": "Platform Mediations" }],
        "created_at": "2024-02-07T11:00:00Z", "updated_at": "2024-02-07T11:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_ETL_Service",
        "name": "ETL Service",
        "version": "1.3.0",
        "tenants": [{ "id": "Tenant_Analytics", "name": "Analytics" }],
        "created_at": "2024-02-08T12:00:00Z", "updated_at": "2024-02-08T12:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Notification_Service",
        "name": "Notification Service",
        "version": "1.7.0",
        "tenants": [
            { "id": "Tenant_Low_Level", "name": "Low Level Services" },
            { "id": "Tenant_Medium_Level", "name": "Medium Level Services" }
        ],
        "created_at": "2024-02-09T14:00:00Z", "updated_at": "2024-02-09T14:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Content_Delivery_Network",
        "name": "Content Delivery Network (CDN)",
        "version": "2.0.0",
        "tenants": [{ "id": "Tenant_High_Level", "name": "High Level Services" }],
        "created_at": "2024-02-11T16:00:00Z", "updated_at": "2024-02-11T16:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Secret_Management",
        "name": "Secret Management",
        "version": "1.1.0",
        "tenants": [
            { "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" },
            { "id": "Tenant_Platform_Infra", "name": "Platform Infra" }
        ],
        "created_at": "2024-03-10T10:00:00Z", "updated_at": "2024-03-10T10:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_API_Gateway",
        "name": "API Gateway",
        "version": "2.4.0",
        "tenants": [
            { "id": "Tenant_Platform_Mediations", "name": "Platform Mediations" },
            { "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }
        ],
        "created_at": "2024-03-12T11:00:00Z", "updated_at": "2024-03-12T11:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Metrics_Service",
        "name": "Metrics Service",
        "version": "1.9.0",
        "tenants": [
            { "id": "Tenant_Platform_Infra", "name": "Platform Infra" },
            { "id": "Tenant_Platform_Foundation", "name": "Platform Foundation" }
        ],
        "created_at": "2024-03-14T12:00:00Z", "updated_at": "2024-03-14T12:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Data_Streaming_Service",
        "name": "Data Streaming Service",
        "version": "2.0.0",
        "tenants": [
            { "id": "Tenant_Analytics", "name": "Analytics" },
            { "id": "Tenant_Platform_Mediations", "name": "Platform Mediations" }
        ],
        "created_at": "2024-03-16T14:00:00Z", "updated_at": "2024-03-16T14:00:00Z",
        "phases": []
    },
    {
        "id": "Comp_Cache_Service",
        "name": "Cache Service",
        "version": "3.1.0",
        "tenants": [
            { "id": "Tenant_Medium_Level", "name": "Medium Level Services" },
            { "id": "Tenant_High_Level", "name": "High Level Services" }
        ],
        "created_at": "2024-03-18T15:00:00Z", "updated_at": "2024-03-18T15:00:00Z",
        "phases": []
    }
];


async function seedComponents() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    // This will only delete the initial seed items, preserving user-added data
    await collection.deleteMany({ id: { $in: initialComponents.map(i => i.id) } });
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
    const collection = db.collection(COLLECTION_NAME);

    const count = await collection.countDocuments();
    if (count === 0) {
        await seedComponents();
    }
    
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

    