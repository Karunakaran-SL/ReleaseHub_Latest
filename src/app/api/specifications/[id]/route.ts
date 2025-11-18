

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const OptionSchema = z.object({
  id: z.string(),
  name: z.string(),
}).optional();

const BladeSchema = z.object({
  name: z.string(),
  cpuType: z.string().optional(),
  memoryPerBlade: z.number().optional(),
  storageCapacity: z.number().optional(),
});

const SpecificationUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hw_type: OptionSchema,
  vendor: z.string().optional(),
  image: z.string().url().optional().nullable(),
  service_contract_type: OptionSchema,
  contact_point_email: z.string().email().optional().nullable(),
  contact_point_phone: z.string().optional().nullable(),
  custom_fields: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  symmetric: z.boolean().optional(),
  total_cpu: z.number().optional(),
  memory_gb: z.number().optional(),
  storage_gb: z.number().optional(),
  bladeCount: z.number().optional(),
  cpuType: z.string().optional(),
  memoryPerBlade: z.number().optional(),
  blades: z.array(BladeSchema).optional(),
  network_cards: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  plug_power_cords: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  hypervisor: OptionSchema,
  updateComment: z.string().min(1, 'Update comment is required.'),
  // New fields
  cpuArchitecture: z.string().optional(),
  virtualizationSupport: z.boolean().optional(),
  biosVersion: z.string().optional(),
  firmwareVersion: z.string().optional(),
  networkTopology: z.object({
      managementVLAN: z.string().optional(),
      storageVLAN: z.string().optional(),
      workloadVLAN: z.string().optional(),
  }).optional(),
  ipAddressPool: z.object({
      management: z.string().optional(),
      storage: z.string().optional(),
      workload: z.string().optional(),
  }).optional(),
  iloCredentials: z.object({
      username: z.string().optional(),
      password: z.string().optional(),
  }).optional(),
  diskLayout: z.object({
      osDisk: z.string().optional(),
      dataDisk: z.string().optional(),
  }).optional(),
  raidConfiguration: z.string().optional(),
  timeSync: z.string().optional(),
  sshKeys: z.string().optional(),
});


// Get a single item by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const item = await db.collection('specifications').findOne({ _id: id });

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
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const { id } = params;

        const body = await req.json();
        
        const validatedData = SpecificationUpdateSchema.safeParse(body);
        if (!validatedData.success) {
            console.error(validatedData.error);
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const { updateComment, ...specData } = validatedData.data;

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('specifications');
        
        const result = await collection.updateOne(
            { _id: id },
            { $set: specData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'UPDATE',
            entity: 'specification',
            entityId: id,
            comment: updateComment,
        });

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
        const result = await db.collection('specifications').deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }
        
        await logAuditEvent({
            action: 'DELETE',
            entity: 'specification',
            entityId: id,
            comment: comment,
        });

        return NextResponse.json({ message: 'Item deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
