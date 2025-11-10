
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const SecuritySchema = z.object({
  internal: z.object({
    secure: z.boolean(),
    authentication: z.boolean(),
  }),
  external: z.object({
    secure: z.boolean(),
    authentication: z.boolean(),
  }),
});

const InterfaceSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.object({
    id: z.string(),
    name: z.string(),
  }),
  version: z.string().min(1),
  description: z.string().optional(),
  owner_name: z.string().min(1),
  owner_email: z.string().email(),
  documentation: z.string().url().optional(),
  source: z.object({
    id: z.string(),
    name: z.string(),
  }),
  security: SecuritySchema,
  additional_docs: z.array(z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    url: z.string().url(),
  })).optional(),
  custom_fields: z.array(z.object({
      key: z.string(),
      value: z.string()
  })).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const COLLECTION_NAME = 'cmdb_interfaces';

const interfacePool = [
    // Provided by Components
    { id: "Interface_AuthService", name: "Auth Service Interface", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Platform Foundation", source: { id: "Comp_AuthService", name: "Authentication Service" } },
    { id: "Interface_UserProfileAPI", name: "User Profile API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Platform Foundation", source: { id: "Comp_UserProfile", name: "User Profile Service" } },
    { id: "Interface_LogQuery", name: "Log Query API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Platform Foundation", source: { id: "Comp_LoggingService", name: "Centralized Logging" } },
    { id: "Interface_OrderAPI", name: "Order API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Retail Services", source: { id: "Comp_OrderProcessor", name: "Order Processor" } },
    { id: "Interface_InventoryAPI", name: "Inventory API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Retail Services", source: { id: "Comp_InventoryMgmt", name: "Inventory Management" } },
    { id: "Interface_CatalogAPI", name: "Catalog API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Retail Services", source: { id: "Comp_ProductCatalog", name: "Product Catalog" } },
    { id: "Interface_Generic_Output", name: "Generic Output", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Platform Foundation", source: { id: "Comp_Generated", name: "Generated Component" } },

    // Provided by Applications
    { id: "Interface_UserDashboardAPI", name: "User Dashboard API", type: { id: "Interface_Type_API", "name": "API" }, owner_name: "Platform Foundation", source: { id: "App_UserDashboard", name: "User Dashboard" } },
    { id: "Interface_AdminAPI", name: "Admin API", type: { id: "Interface_Type_API", "name": "API" }, owner_name: "Platform Foundation", source: { id: "App_AdminConsole", name: "Admin Console" } },

    // External / Required Interfaces
    { id: "Interface_LoginAPI", name: "Login API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "External IDP", source: { id: "External", name: "External" } },
    { id: "Interface_Database", name: "Database Interface", type: { id: "Interface_Type_DB", name: "Database" }, owner_name: "DBA Team", source: { id: "External", name: "External" } },
    { id: "Interface_Fluentd", name: "Fluentd Collector", type: { id: "Interface_Type_Collector", name: "Collector" }, owner_name: "Infra Team", source: { id: "External", name: "External" } },
    { id: "Interface_PaymentGateway", name: "Payment Gateway API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "External Payment Provider", source: { id: "External", name: "External" } },
    { id: "Interface_Prometheus", name: "Prometheus Endpoint", type: { id: "Interface_Type_Metrics", name: "Metrics" }, owner_name: "Monitoring Team", source: { id: "External", name: "External" } },
    { id: "Interface_SendGrid", name: "SendGrid API", type: { id: "Interface_Type_API", name: "API" }, owner_name: "SendGrid", source: { id: "External", name: "External" } },
    { id: "Interface_Generic_Input", name: "Generic Input", type: { id: "Interface_Type_API", name: "API" }, owner_name: "Unknown", source: { id: "External", name: "External" } },
].map(iface => ({
    ...iface,
    _id: iface.id,
    version: "1.0.0",
    description: `Interface for ${iface.name}`,
    owner_email: `${iface.owner_name.toLowerCase().replace(/\s/g, '.')}@example.com`,
    security: {
        internal: { secure: true, authentication: true },
        external: { secure: false, authentication: false }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}));



async function seedInterfaces() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.deleteMany({_id: {$in: interfacePool.map(i => i._id)}})
    await collection.insertMany(interfacePool as any[]);

    console.log('Seeded interfaces collection.');
  } catch (error) {
    console.error('Error seeding interfaces:', error);
  }
}

// List all interfaces
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    await seedInterfaces();
    
    const items = await db.collection(COLLECTION_NAME).find({}).sort({updated_at: -1}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new interface
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = InterfaceSchema.safeParse(body);

        if (!validatedData.success) {
            console.error(validatedData.error.flatten().fieldErrors)
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
            entity: 'interface',
            entityId: newItem.id,
            comment: `Interface "${newItem.name}" created.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
