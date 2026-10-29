
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const BaselineUpdateSchema = z.object({
    status: z.enum(['DRAFT', 'VALIDATING', 'VALIDATED', 'RELEASED', 'ARCHIVED', 'REJECTED']).optional(),
    updateComment: z.string().min(1, 'Update comment is required.'),
    validation_phases: z.any().optional(),
});


// Get a single baseline by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection('baselines').findOne({ _id: id as any });

        if (!item) {
            return NextResponse.json({ message: 'Baseline not found.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Update a baseline
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const body = await req.json();
        const validatedData = BaselineUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const { updateComment, ...baselineData } = validatedData.data;

        const result = await db.collection('baselines').updateOne(
            { _id: id as any },
            { $set: { ...baselineData, updated_at: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Baseline not found.' }, { status: 404 });
        }

        const baseline = await db.collection('baselines').findOne({ _id: id as any });
        if (!baseline) {
            return NextResponse.json({ message: 'Baseline not found after update.' }, { status: 404 });
        }

        if (baselineData.status === 'RELEASED') {
            await db.collection('products').updateOne(
                { _id: baseline.product.id },
                { $set: { version: baseline.product.version } }
            );
            await logAuditEvent({
                action: 'UPDATE',
                entity: 'product',
                entityId: baseline.product.id,
                comment: `Version updated to ${baseline.product.version} via baseline release.`,
            });
        }

        await logAuditEvent({
            action: 'UPDATE',
            entity: 'baseline',
            entityId: id,
            comment: updateComment,
        });

        const updatedItem = await db.collection('baselines').findOne({ _id: id as any });
        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
