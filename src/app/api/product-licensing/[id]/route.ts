import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const COLLECTION_NAME = 'product_licensing';

const ProductLicensingUpdateSchema = z.object({
  license_model: z.enum(['online', 'offline', 'hybrid']).optional(),
  entitlements: z.array(z.string()).optional(),
  package_included: z.boolean().optional(),
  validity: z.string().optional(),
  compliance: z.string().optional(),
  updateComment: z.string().min(1, 'Update comment is required'),
});

// Update a product license
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const validatedData = ProductLicensingUpdateSchema.safeParse(body);

        if (!validatedData.success) {
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
            return NextResponse.json({ message: 'Product license not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'UPDATE',
            entity: 'product_license',
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
