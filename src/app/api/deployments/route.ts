
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const DeploymentSchema = z.object({
  productId: z.string().min(1),
  specificationId: z.string().min(1),
  hypervisorId: z.string().min(1),
  foundationComponentIds: z.array(z.string()).min(1),
  security: z.object({
    encryptionKey: z.string().optional().nullable(),
    signingCert: z.string().optional().nullable(),
    pkiDetails: z.string().optional().nullable(),
    iamToken: z.string().optional().nullable(),
  }).optional(),
  details: z.object({
    deploymentId: z.string().min(1),
    customer: z.string().min(1),
    factory: z.string().optional().nullable(),
    region: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    availabilityZone: z.string().optional().nullable(),
    customerKeyPair: z.string().optional().nullable(),
  })
});

// List all deployments
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection('deployments').find({}).sort({ createdAt: -1 }).toArray();
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
            console.error(validatedData.error.flatten().fieldErrors);
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...validatedData.data,
            _id: validatedData.data.details.deploymentId,
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
