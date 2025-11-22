
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'app_catalog';

const AppCatalogUpdateSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  kubernetesConfig: z.record(z.any()).optional(),
});


// Get a single item by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

        if (!item) {
            return NextResponse.json({ message: 'App Catalog Item not found.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Update an item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
        }

        const body = await req.json();
        const validatedData = AppCatalogUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: validatedData.data }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }
        
        await logAuditEvent({
            action: 'UPDATE',
            entity: 'app_catalog',
            entityId: id,
            comment: `Updated App Catalog item ${validatedData.data.name || id}.`,
        });

        const updatedItem = await collection.findOne({ _id: new ObjectId(id) });
        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete an item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        
        const itemToDelete = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        if (!itemToDelete) {
             return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'DELETE',
            entity: 'app_catalog',
            entityId: id,
            comment: `Deleted App Catalog item "${(itemToDelete as any).name}".`,
        });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
