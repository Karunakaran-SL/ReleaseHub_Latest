
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const WorkflowUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});


// Get a single item by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection('workflows').findOne({ _id: id });

        if (!item) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
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
        const { id } = params;
        const body = await req.json();
        const validatedData = WorkflowUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('workflows');

        const result = await collection.updateOne(
            { _id: id },
            { $set: validatedData.data }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }

        const updatedItem = await collection.findOne({ _id: id });

        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete an item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection('workflows').deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
