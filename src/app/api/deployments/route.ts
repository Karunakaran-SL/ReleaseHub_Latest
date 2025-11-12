
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

// This is a placeholder schema. We will expand it as we build the wizard.
const DeploymentSchema = z.object({
  productId: z.string(),
  specificationId: z.string(),
});

// List all deployments
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection('deployments').find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new deployment
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = DeploymentSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...validatedData.data,
            _id: `dep_${Date.now()}`,
            createdBy: user.username,
            createdAt: new Date().toISOString(),
            status: 'PROVISIONING',
        };
        
        await db.collection('deployments').insertOne(newItem as any);

        await logAuditEvent({
            action: 'CREATE',
            entity: 'deployment',
            entityId: newItem._id,
            comment: `Initiated new deployment for product ${newItem.productId}.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
