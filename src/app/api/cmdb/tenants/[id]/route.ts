
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const OnboardingFieldProofSchema = z.object({
  link: z.string().optional(),
}).optional();

const OnboardingFieldSchema = z.object({
  name: z.string(),
  value: z.any(),
  proof: OnboardingFieldProofSchema,
});

const TenantPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.string(),
  fields: z.array(OnboardingFieldSchema),
});

const TenantUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  artifact_location: z.string().optional(),
  dependent_tenants: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  products: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  resources: z.object({
      cpu: z.number().optional(),
      memory_gb: z.number().optional(),
      storage_gb: z.number().optional(),
  }).optional(),
  phases: z.array(TenantPhaseSchema).optional(),
  updateComment: z.string().min(1, 'Update comment is required.'),
});

const COLLECTION_NAME = 'cmdb_tenants';

// Get a single tenant by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection(COLLECTION_NAME).findOne({ _id: id });

        if (!item) {
            return NextResponse.json({ message: 'Tenant not found.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Update a tenant
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const validatedData = TenantUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        
        const { updateComment, ...tenantData } = validatedData.data;

        const updatePayload = {
            ...tenantData,
            updated_at: new Date().toISOString()
        };

        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: id },
            { $set: updatePayload }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Tenant not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'UPDATE',
            entity: 'tenant',
            entityId: id,
            comment: updateComment,
        });

        const updatedItem = await db.collection(COLLECTION_NAME).findOne({ _id: id });
        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete a tenant
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { comment } = await req.json();
        if (!comment) {
            return NextResponse.json({ message: 'Delete comment is required.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Tenant not found.' }, { status: 404 });
        }
        
        await logAuditEvent({
            action: 'DELETE',
            entity: 'tenant',
            entityId: id,
            comment: comment,
        });

        return NextResponse.json({ message: 'Tenant deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
