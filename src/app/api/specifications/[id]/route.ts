import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const SpecificationUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  hw_type: z.object({ id: z.string(), name: z.string() }).optional(),
  vendor: z.string().optional(),
  total_cpu: z.number().optional(),
  memory_gb: z.number().optional(),
  storage_gb: z.number().optional(),
  hypervisor: z.object({ id: z.string(), name: z.string() }).optional(),
  image: z.string().url().optional(),
  service_contract_type: z.object({ id: z.string(), name: z.string() }).optional(),
  contact_point_email: z.string().email().optional(),
  contact_point_phone: z.string().optional(),
  network_cards: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  plug_power_cords: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  custom_fields: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
});


// Get a single item by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection('specifications').findOne({ _id: new ObjectId(id) });

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
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID.' }, { status: 400 });
        }

        const body = await req.json();
        const validatedData = SpecificationUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('specifications');

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: validatedData.data }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }

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
        const { id } = params;
         if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection('specifications').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
