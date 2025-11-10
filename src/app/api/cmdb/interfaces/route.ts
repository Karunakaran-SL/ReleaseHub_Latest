
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

const initialInterfaces = [
    {
        "id": "Interface_Product_Catalog_API", "name": "Product Catalog API",
        "type": { "id": "Interface_Type_API", "name": "API" }, "version": "1.0",
        "owner_name": "E-com Team", "owner_email": "ecom@example.com",
        "source": { "id": "Comp_Inventory_Service", "name": "Inventory Service" },
        "security": { "internal": { "secure": true, "authentication": true }, "external": { "secure": true, "authentication": false } },
        "created_at": "2024-01-20T10:00:00Z", "updated_at": "2024-01-20T10:00:00Z"
    },
    {
        "id": "Interface_User_Auth_API", "name": "User Authentication API",
        "type": { "id": "Interface_Type_API", "name": "API" }, "version": "2.1",
        "owner_name": "Security Team", "owner_email": "security@example.com",
        "source": { "id": "Comp_Auth_Service", "name": "Authentication Service" },
        "security": { "internal": { "secure": true, "authentication": true }, "external": { "secure": true, "authentication": true } },
        "created_at": "2024-01-21T11:00:00Z", "updated_at": "2024-01-21T11:00:00Z"
    },
    {
        "id": "Interface_Payment_API", "name": "Payment Processing API",
        "type": { "id": "Interface_Type_API", "name": "API" }, "version": "1.5",
        "owner_name": "Finance Team", "owner_email": "finance@example.com",
        "source": { "id": "Comp_Payment_Gateway", "name": "Payment Gateway" },
        "security": { "internal": { "secure": true, "authentication": true }, "external": { "secure": true, "authentication": true } },
        "created_at": "2024-01-22T12:00:00Z", "updated_at": "2024-01-22T12:00:00Z"
    },
    {
        "id": "Interface_Order_API", "name": "Order Management API",
        "type": { "id": "Interface_Type_API", "name": "API" }, "version": "3.0",
        "owner_name": "E-com Team", "owner_email": "ecom@example.com",
        "source": { "id": "App_Order_Processing", "name": "Order Processing Backend" },
        "security": { "internal": { "secure": true, "authentication": true }, "external": { "secure": false, "authentication": false } },
        "created_at": "2024-01-23T13:00:00Z", "updated_at": "2024-01-23T13:00:00Z"
    },
    {
        "id": "Interface_Web_UI", "name": "Main Web UI",
        "type": { "id": "Interface_Type_UI", "name": "UI" }, "version": "1.0",
        "owner_name": "Frontend Team", "owner_email": "frontend@example.com",
        "source": { "id": "App_Ecom_Storefront", "name": "E-Commerce Storefront" },
        "security": { "internal": { "secure": false, "authentication": false }, "external": { "secure": false, "authentication": false } },
        "created_at": "2024-01-27T17:00:00Z", "updated_at": "2024-01-27T17:00:00Z"
    },
    {
        "id": "Interface_Analytics_UI", "name": "Analytics Web UI",
        "type": { "id": "Interface_Type_UI", "name": "UI" }, "version": "1.0",
        "owner_name": "Analytics Team", "owner_email": "analytics@example.com",
        "source": { "id": "App_Analytics_Dashboard", "name": "Analytics Dashboard" },
        "security": { "internal": { "secure": true, "authentication": true }, "external": { "secure": false, "authentication": false } },
        "created_at": "2024-01-28T18:00:00Z", "updated_at": "2024-01-28T18:00:00Z"
    }
];


async function seedInterfaces() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    for (const iface of initialInterfaces) {
        await collection.updateOne(
            { id: iface.id },
            { $set: { ...iface, _id: iface.id, updated_at: new Date().toISOString() }, $setOnInsert: { created_at: new Date().toISOString() } },
            { upsert: true }
        );
    }
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
