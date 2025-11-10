import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { revalidateDependencyTree } from '@/lib/dependency-graph';

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

const ApplicationUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  artifact_location: z.string().optional(),
  artifact_name: z.string().optional(),
  tenants: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  resources: z.object({
    default_instances: z.number().optional(),
    cpu: z.number().optional(),
    memory: z.number().optional(),
    storage: z.number().optional(),
  }).optional(),
  custom_labels: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  provided_interfaces: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  dependent_interfaces: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  phases: z.array(CmdbPhaseSchema).optional(),
  updateComment: z.string().min(1, 'Update comment is required.'),
});

const COLLECTION_NAME = 'cmdb_applications';

// Get a single application by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

        if (!item) {
            return NextResponse.json({ message: 'Application not found.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Update an application
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID.' }, { status: 400 });
        }

        const body = await req.json();
        const validatedData = ApplicationUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        
        const { updateComment, ...applicationData } = validatedData.data;

        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: new ObjectId(id) },
            { $set: applicationData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Application not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'UPDATE',
            entity: 'application',
            entityId: id,
            comment: updateComment,
        });
        
        const products = await db.collection('products').find({}).toArray();
        for (const product of products) {
            revalidateDependencyTree(product._id.toString());
        }

        const updatedItem = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete an application
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
         if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID.' }, { status: 400 });
        }

        const { comment } = await req.json();
        if (!comment) {
            return NextResponse.json({ message: 'Delete comment is required.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Application not found.' }, { status: 404 });
        }
        
        await logAuditEvent({
            action: 'DELETE',
            entity: 'application',
            entityId: id,
            comment: comment,
        });

        const products = await db.collection('products').find({}).toArray();
        for (const product of products) {
            revalidateDependencyTree(product._id.toString());
        }

        return NextResponse.json({ message: 'Application deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}