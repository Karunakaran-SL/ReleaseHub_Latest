

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


// List all interfaces
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
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
