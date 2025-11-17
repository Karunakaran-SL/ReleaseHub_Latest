
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const COLLECTION_NAME = 'licenses';

const LicenseUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    type: z.enum(['open-source', 'proprietary', 'subscription', 'perpetual']).optional(),
    owner: z.string().min(1).optional(),
    components: z.array(z.string()).optional(),
    products: z.array(z.string()).optional(),
    tenants: z.array(z.string()).optional(),
    apps: z.array(z.string()).optional(),
    integrations: z.array(z.string()).optional(),
    versions: z.array(z.string()).optional(),
    status: z.enum(['active', 'expired', 'deprecated']).optional(),
    updateComment: z.string().min(1, 'Update comment is required'),
});

// GET a single license
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection(COLLECTION_NAME).findOne({ _id: id });

        if (!item) {
            return NextResponse.json({ message: 'License not found.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Update a license
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const validatedData = LicenseUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            console.error(validatedData.error)
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        
        const { updateComment, ...licenseData } = validatedData.data;

        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: id },
            { $set: licenseData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'License not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'UPDATE',
            entity: 'license',
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


// Delete a license
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
            return NextResponse.json({ message: 'License not found.' }, { status: 404 });
        }
        
        await logAuditEvent({
            action: 'DELETE',
            entity: 'license',
            entityId: id,
            comment: comment,
        });

        return NextResponse.json({ message: 'License deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
