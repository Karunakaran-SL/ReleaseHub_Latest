
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const COLLECTION_NAME = 'specification_gpu_types';

const UpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        if (!item) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        const body = await req.json();
        const validatedData = UpdateSchema.safeParse(body);
        if (!validatedData.success) return NextResponse.json({ errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: validatedData.data });

        if (result.matchedCount === 0) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        const updatedItem = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
