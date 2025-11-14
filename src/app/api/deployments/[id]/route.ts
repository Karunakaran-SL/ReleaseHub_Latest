
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

// This is a placeholder schema for updates. We can expand it later.
const DeploymentUpdateSchema = z.object({
  status: z.enum(['PROVISIONING', 'ACTIVE', 'UPGRADING', 'FAILED', 'DECOMMISSIONED']).optional(),
  updateComment: z.string().min(1, 'Update comment is required.'),
});

// Get a single deployment by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection('deployments').findOne({ _id: id });

        if (!item) {
            return NextResponse.json({ message: 'Deployment not found.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error(error);
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
