
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

// Expanded schema to handle full updates from the view/edit page
const DeploymentUpdateSchema = z.object({
  productId: z.string().optional(),
  specificationId: z.string().optional(),
  hypervisorId: z.string().optional(),
  foundationComponentIds: z.array(z.string()).optional(),
  security: z.object({
    encryptionKey: z.string().optional(),
    signingCert: z.string().optional(),
    pkiDetails: z.string().optional(),
    iamToken: z.string().optional(),
  }).optional(),
  details: z.object({
    deploymentId: z.string().optional(),
    customer: z.string().optional(),
    factory: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    availabilityZone: z.string().optional(),
    customerKeyPair: z.string().optional(),
  }).optional(),
  status: z.enum(['PROVISIONING', 'ACTIVE', 'UPGRADING', 'FAILED', 'DECOMMISSIONED']).optional(),
  updateComment: z.string().min(1, 'Update comment is required.'),
});

// Get a single deployment by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        console.log(`[API /api/deployments/{id}] Fetching deployment with ID: ${id}`);
        
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection('deployments').findOne({ _id: id });

        if (!item) {
            console.log(`[API /api/deployments/{id}] Deployment not found for ID: ${id}`);
            return NextResponse.json({ message: 'Deployment not found.' }, { status: 404 });
        }
        
        console.log(`[API /api/deployments/{id}] Found deployment:`, JSON.stringify(item, null, 2));
        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error(`[API /api/deployments/{id}] Error fetching deployment:`, error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Update a deployment
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const body = await req.json();
        const validatedData = DeploymentUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            console.log(validatedData.error.flatten().fieldErrors);
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        
        const { updateComment, ...deploymentData } = validatedData.data;

        const result = await db.collection('deployments').updateOne(
            { _id: id },
            { $set: deploymentData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Deployment not found.' }, { status: 404 });
        }
        
        await logAuditEvent({
            action: 'UPDATE',
            entity: 'deployment',
            entityId: id,
            comment: updateComment,
        });

        const updatedItem = await db.collection('deployments').findOne({ _id: id });
        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete a deployment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { comment } = await req.json();
        if (!comment) return NextResponse.json({ message: 'Delete comment is required.' }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection('deployments').deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Deployment not found.' }, { status: 404 });
        }
        
        await logAuditEvent({
            action: 'DELETE',
            entity: 'deployment',
            entityId: id,
            comment: comment,
        });

        return NextResponse.json({ message: 'Deployment deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
