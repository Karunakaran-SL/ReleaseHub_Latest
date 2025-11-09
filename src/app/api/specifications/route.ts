import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const SpecificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  hw_type: z.object({ id: z.string(), name: z.string() }),
  vendor: z.string(),
  total_cpu: z.number(),
  memory_gb: z.number(),
  storage_gb: z.number(),
  hypervisor: z.object({ id: z.string(), name: z.string() }),
  image: z.string().url(),
  service_contract_type: z.object({ id: z.string(), name: z.string() }),
  contact_point_email: z.string().email(),
  contact_point_phone: z.string(),
  network_cards: z.array(z.object({ id: z.string(), name: z.string() })),
  plug_power_cords: z.array(z.object({ id: z.string(), name: z.string() })),
  custom_fields: z.array(z.object({ key: z.string(), value: z.string() })),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const initialSpecifications = [
    {
      "id": "HW_PowerEdge_R740",
      "name": "PowerEdge R740",
      "hw_type": { "id": "HWType_Rack", "name": "Rack" },
      "vendor": "Dell EMC",
      "total_cpu": 64,
      "memory_gb": 256,
      "storage_gb": 4096,
      "hypervisor": { "id": "Hypervisor_VMWare_ESXi", "name": "VMWare ESXi" },
      "image": "https://picsum.photos/seed/spec1/200/200",
      "service_contract_type": { "id": "ServiceContract_ProSupport_Plus", "name": "ProSupport Plus" },
      "contact_point_email": "prosupport@dell.com",
      "contact_point_phone": "1-800-945-3355",
      "network_cards": [
        { "id": "NetworkCard_10GbE_SFP_Plus", "name": "10GbE SFP+" },
        { "id": "NetworkCard_1GbE_BaseT", "name": "1GbE BaseT" }
      ],
      "plug_power_cords": [
        { "id": "PowerCord_NEMA_5_15P", "name": "NEMA 5-15P" }
      ],
      "custom_fields": [
        { "key": "Asset Tag", "value": "ASSET-12345" },
        { "key": "Data Center Location", "value": "US-EAST-1" }
      ],
      "created_at": "2023-11-24T10:00:00Z",
      "updated_at": "2023-11-24T10:00:00Z"
    },
    {
      "id": "HW_ProLiant_DL380",
      "name": "ProLiant DL380 Gen10",
      "hw_type": { "id": "HWType_Rack", "name": "Rack" },
      "vendor": "HPE",
      "total_cpu": 48,
      "memory_gb": 128,
      "storage_gb": 2048,
      "hypervisor": { "id": "Hypervisor_Microsoft_HyperV", "name": "Microsoft Hyper-V" },
      "image": "https://picsum.photos/seed/spec2/200/200",
      "service_contract_type": { "id": "ServiceContract_Foundation_Care", "name": "Foundation Care" },
      "contact_point_email": "support@hpe.com",
      "contact_point_phone": "1-800-633-3600",
      "network_cards": [
        { "id": "NetworkCard_10GbE_SFP_Plus", "name": "10GbE SFP+" }
      ],
      "plug_power_cords": [
        { "id": "PowerCord_C13_C14", "name": "C13 to C14" }
      ],
      "custom_fields": [
        { "key": "Asset Tag", "value": "ASSET-67890" },
        { "key": "Data Center Location", "value": "EU-WEST-1" }
      ],
      "created_at": "2023-11-25T11:00:00Z",
      "updated_at": "2023-11-25T11:00:00Z"
    }
];

async function seedSpecifications() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('specifications');
    
    await collection.deleteMany({});
    await collection.insertMany(initialSpecifications as any);
    console.log('Cleared and re-seeded specifications collection.');

  } catch (error) {
    console.error('Error seeding specifications:', error);
  }
}

// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('specifications');
    
    const count = await collection.countDocuments();
    if (count === 0) {
        await seedSpecifications();
    }

    const items = await collection.find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new item
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = SpecificationSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('specifications');
        
        const result = await collection.insertOne(validatedData.data as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };


        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
