

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';

const OptionSchema = z.object({
  id: z.string(),
  name: z.string(),
}).optional();

const BladeSchema = z.object({
  name: z.string(),
  cpuType: z.string().optional(),
  cpuCores: z.number().optional(),
  memory: z.number().optional(),
  diskType: z.enum(['SSD', 'HDD']).optional(),
  diskCapacity: z.number().optional(),
  networkInterfaces: z.array(z.object({
      name: z.string(),
      type: z.string(),
      speed: z.string(),
  })).optional(),
});

const SpecificationSchema = z.object({
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


// List all specifications
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const items = await db.collection('specifications').find({}).toArray();

    return NextResponse.json(items, { status: 200 });
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
