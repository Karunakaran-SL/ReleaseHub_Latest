

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';

const SpecificationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  json_string: z.string().min(1, 'JSON string is required'),
});

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch only necessary fields for the list view
    const items = await db.collection('specifications').find({}).project({ name: 1, _id: 1, json_string: 1 }).toArray();

    // Parse json_string to extract display fields
    const formattedItems = items.map(item => {
        try {
            const specObject = JSON.parse(item.json_string);
            return {
                _id: item._id,
                name: item.name,
                hw_type: { name: specObject.hw_type?.name || 'N/A' },
                vendor: specObject.vendor || 'N/A',
                image: specObject.image || `https://picsum.photos/seed/${item._id}/40/40`,
            };
        } catch (e) {
            // Handle cases where json_string might be invalid
            return {
                 _id: item._id,
                 name: item.name,
                 hw_type: { name: 'Error' },
                 vendor: 'Error',
                 image: `https://picsum.photos/seed/error/40/40`,
            }
        }
    });

    return NextResponse.json(formattedItems, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new item
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await req.json();
        const validatedData = SpecificationSchema.safeParse(body);

        if (!validatedData.success) {
            console.error(validatedData.error.flatten().fieldErrors);
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('specifications');
        
        const newItem = {
            ...validatedData.data,
            _id: validatedData.data.name.replace(/[^a-zA-Z0-9]/g, ''),
        };

        const existing = await collection.findOne({ _id: newItem._id });
        if (existing) {
             return NextResponse.json({ message: `Specification with ID "${newItem._id}" already exists.` }, { status: 409 });
        }
        
        await collection.insertOne(newItem as any);
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'specification',
            entityId: newItem._id,
            comment: `Specification "${newItem.name}" created.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
