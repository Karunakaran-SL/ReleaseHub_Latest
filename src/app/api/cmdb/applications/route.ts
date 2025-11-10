

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


const initialApplications = [
    {
        "id": "App_Ecom_Storefront",
        "name": "E-Commerce Storefront",
        "description": "Customer-facing web application for browsing and purchasing products.",
        "version": "2.1.0",
        "tenants": [{ "id": "Tenant_High_Level", "name": "High Level Services" }],
        "dependent_components": [
            { "id": "Comp_Auth_Service", "name": "Authentication Service" },
            { "id": "Comp_Search_Service", "name": "Search Service" }
        ],
        "dependent_applications": [{ "id": "App_Order_Processing", "name": "Order Processing Backend" }],
        "provided_interfaces": [{ "id": "Interface_Web_UI", "name": "Main Web UI" }],
        "dependent_interfaces": [
            { "id": "Interface_Product_Catalog_API", "name": "Product Catalog API" },
            { "id": "Interface_User_Auth_API", "name": "User Authentication API" }
        ],
        "created_at": "2024-01-15T10:00:00Z", "updated_at": "2024-01-15T10:00:00Z",
        "phases": []
    },
    {
        "id": "App_Order_Processing",
        "name": "Order Processing Backend",
        "description": "Handles order creation, payment processing, and fulfillment.",
        "version": "1.5.0",
        "tenants": [
            { "id": "Tenant_Medium_Level", "name": "Medium Level Services" },
            { "id": "Tenant_High_Level", "name": "High Level Services" }
        ],
        "dependent_components": [
            { "id": "Comp_Payment_Gateway", "name": "Payment Gateway" },
            { "id": "Comp_Inventory_Service", "name": "Inventory Service" }
        ],
        "provided_interfaces": [{ "id": "Interface_Order_API", "name": "Order Management API" }],
        "dependent_interfaces": [{ "id": "Interface_Payment_API", "name": "Payment Processing API" }],
        "created_at": "2024-01-16T11:00:00Z", "updated_at": "2024-01-16T11:00:00Z",
        "phases": []
    },
    {
        "id": "App_Analytics_Dashboard",
        "name": "Analytics Dashboard",
        "description": "Provides business intelligence and sales analytics.",
        "version": "3.0.0",
        "tenants": [{ "id": "Tenant_Analytics", "name": "Analytics" }],
        "dependent_components": [{ "id": "Comp_Data_Warehouse_Connector", "name": "Data Warehouse Connector" }],
        "provided_interfaces": [{ "id": "Interface_Analytics_UI", "name": "Analytics Web UI" }],
        "dependent_interfaces": [{ "id": "Interface_Reporting_API", "name": "Reporting API" }],
        "created_at": "2024-02-10T09:00:00Z", "updated_at": "2024-02-10T09:00:00Z",
        "phases": []
    },
    {
        "id": "App_Mobile_Companion",
        "name": "Mobile Companion App",
        "description": "iOS and Android app for on-the-go shopping.",
        "version": "1.2.0",
        "tenants": [{ "id": "Tenant_High_Level", "name": "High Level Services" }],
        "dependent_applications": [{ "id": "App_Ecom_Storefront", "name": "E-Commerce Storefront" }],
        "provided_interfaces": [],
        "dependent_interfaces": [{ "id": "Interface_Order_API", "name": "Order Management API" }],
        "created_at": "2024-03-05T14:00:00Z", "updated_at": "2024-03-05T14:00:00Z",
        "phases": []
    },
    {
        "id": "App_CRM_Platform",
        "name": "CRM Platform",
        "description": "Manages customer relationships, support tickets, and marketing campaigns.",
        "version": "4.0.1",
        "tenants": [
            { "id": "Tenant_Low_Level", "name": "Low Level Services" },
            { "id": "Tenant_Analytics", "name": "Analytics" }
        ],
        "dependent_components": [{ "id": "Comp_Email_Service", "name": "Email Service" }],
        "provided_interfaces": [{ "id": "Interface_Customer_Data_API", "name": "Customer Data API" }],
        "created_at": "2024-02-20T16:00:00Z", "updated_at": "2024-02-20T16:00:00Z",
        "phases": []
    },
    {
        "id": "App_Marketing_Automation",
        "name": "Marketing Automation",
        "description": "Automates marketing campaigns and lead nurturing.",
        "version": "1.8.0",
        "tenants": [{ "id": "Tenant_Low_Level", "name": "Low Level Services" }],
        "dependent_applications": [{ "id": "App_CRM_Platform", "name": "CRM Platform" }],
        "dependent_components": [{ "id": "Comp_Email_Service", "name": "Email Service" }],
        "created_at": "2024-04-01T10:00:00Z", "updated_at": "2024-04-01T10:00:00Z",
        "phases": []
    },
    {
        "id": "App_Product_Recommendations",
        "name": "Product Recommendations AI",
        "description": "AI-powered service for personalized product recommendations.",
        "version": "1.0.0",
        "tenants": [{ "id": "Tenant_Medium_Level", "name": "Medium Level Services" }],
        "dependent_interfaces": [{ "id": "Interface_Product_Catalog_API", "name": "Product Catalog API" }],
        "created_at": "2024-04-05T12:00:00Z", "updated_at": "2024-04-05T12:00:00Z",
        "phases": []
    },
    {
        "id": "App_Fraud_Detection",
        "name": "Fraud Detection Service",
        "description": "Real-time fraud detection for transactions.",
        "version": "2.2.0",
        "tenants": [{ "id": "Tenant_Medium_Level", "name": "Medium Level Services" }],
        "dependent_applications": [{ "id": "App_Order_Processing", "name": "Order Processing Backend" }],
        "created_at": "2024-04-10T15:00:00Z", "updated_at": "2024-04-10T15:00:00Z",
        "phases": []
    },
    {
        "id": "App_A_B_Testing",
        "name": "A/B Testing Platform",
        "description": "Platform for running A/B tests on the storefront.",
        "version": "1.1.0",
        "tenants": [{ "id": "Tenant_High_Level", "name": "High Level Services" }],
        "dependent_applications": [{ "id": "App_Ecom_Storefront", "name": "E-Commerce Storefront" }],
        "created_at": "2024-04-12T11:00:00Z", "updated_at": "2024-04-12T11:00:00Z",
        "phases": []
    }
];

async function seedApplications() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    // This will only delete the initial seed items, preserving user-added data
    await collection.deleteMany({ id: { $in: initialApplications.map(i => i.id) } });
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
        
        const result = await db.collection(COLLECTION_NAME).insertOne(validatedData.data as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };

        await logAuditEvent({
            action: 'CREATE',
            entity: 'application',
            entityId: result.insertedId.toString(),
            comment: `Application "${insertedItem.name}" onboarded.`,
        });

        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

    