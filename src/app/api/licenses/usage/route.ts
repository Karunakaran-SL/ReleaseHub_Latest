
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import type { License } from '@/lib/definitions';

const COLLECTION_NAME = 'licenses';

// List all licenses
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection(COLLECTION_NAME).find({}).sort({ name: 1 }).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

const LicenseCreateSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['open-source', 'proprietary', 'subscription', 'perpetual']),
    owner: z.string().min(1),
    components: z.array(z.string()).optional(),
    products: z.array(z.string()).optional(),
    tenants: z.array(z.string()).optional(),
    apps: z.array(z.string()).optional(),
    integrations: z.array(z.string()).optional(),
    versions: z.array(z.string()).optional(),
    status: z.enum(['active', 'expired', 'deprecated']),
});

// Create a new license
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = LicenseCreateSchema.safeParse(body);

        if (!validatedData.success) {
            console.error(validatedData.error)
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            _id: validatedData.data.id,
            ...validatedData.data,
        };
        
        await db.collection(COLLECTION_NAME).insertOne(newItem as any);

        await logAuditEvent({
            action: 'CREATE',
            entity: 'license',
            entityId: newItem._id,
            comment: `License "${newItem.name}" created.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
