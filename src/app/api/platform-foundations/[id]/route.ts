
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const COLLECTION_NAME = 'platform_foundations';

// Get a single platform foundation by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection(COLLECTION_NAME).findOne({ _id: id });

        if (!item) {
            return NextResponse.json({ message: 'Platform Foundation not found.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch platform foundation:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// Update a platform foundation
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const body = await req.json();

        // Basic validation
        if (!body.name || !body.specification) {
            return NextResponse.json({ message: 'Invalid data. Name and specification are required.' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();

        const { _id, ...updateData } = body;

        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Platform Foundation not found.' }, { status: 404 });
        }

        const updatedItem = await db.collection(COLLECTION_NAME).findOne({ _id: id });
        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error('Failed to update platform foundation:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete a platform foundation
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Platform Foundation not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Platform Foundation deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete platform foundation:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
