
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

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
      "image": "https://picsum.photos/seed/specR740/40/40",
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
      "image": "https://picsum.photos/seed/specDL380/40/40",
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
    },
    {
      "id": "HW_Cisco_UCS_B200_M5",
      "name": "Cisco UCS B200 M5 Blade",
      "hw_type": { "id": "HWType_Blade", "name": "Blade" },
      "vendor": "Cisco",
      "total_cpu": 44,
      "memory_gb": 512,
      "storage_gb": 1024,
      "hypervisor": { "id": "Hypervisor_VMWare_ESXi", "name": "VMWare ESXi" },
      "image": "https://picsum.photos/seed/specUCSB200/40/40",
      "service_contract_type": { "id": "ServiceContract_Smart_Net_Total_Care", "name": "Smart Net Total Care" },
      "contact_point_email": "tac@cisco.com",
      "contact_point_phone": "1-800-553-2447",
      "network_cards": [
        { "id": "NetworkCard_VIC_1340", "name": "Cisco VIC 1340" }
      ],
      "plug_power_cords": [
        { "id": "PowerCord_Blade_Chassis", "name": "Blade Chassis" }
      ],
      "custom_fields": [
        { "key": "Chassis ID", "value": "CHASSIS-A01" },
        { "key": "Blade Slot", "value": "5" }
      ],
      "created_at": "2023-11-26T12:00:00Z",
      "updated_at": "2023-11-26T12:00:00Z"
    },
    {
      "id": "HW_Lenovo_ThinkSystem_SR650",
      "name": "Lenovo ThinkSystem SR650",
      "hw_type": { "id": "HWType_Rack", "name": "Rack" },
      "vendor": "Lenovo",
      "total_cpu": 56,
      "memory_gb": 384,
      "storage_gb": 8192,
      "hypervisor": { "id": "Hypervisor_KVM", "name": "KVM" },
      "image": "https://picsum.photos/seed/specSR650/40/40",
      "service_contract_type": { "id": "ServiceContract_Premier_Support", "name": "Premier Support" },
      "contact_point_email": "support@lenovo.com",
      "contact_point_phone": "1-855-253-6686",
      "network_cards": [
        { "id": "NetworkCard_25GbE_SFP28", "name": "25GbE SFP28" }
      ],
      "plug_power_cords": [
        { "id": "PowerCord_C13_C14", "name": "C13 to C14" }
      ],
      "custom_fields": [
        { "key": "Asset Tag", "value": "ASSET-LNV-001" },
        { "key": "Rack Unit", "value": "U12-U14" }
      ],
      "created_at": "2023-11-27T13:00:00Z",
      "updated_at": "2023-11-27T13:00:00Z"
    },
    {
      "id": "HW_Supermicro_SuperServer_2029U",
      "name": "Supermicro SuperServer 2029U-TR4",
      "hw_type": { "id": "HWType_Rack", "name": "Rack" },
      "vendor": "Supermicro",
      "total_cpu": 80,
      "memory_gb": 1024,
      "storage_gb": 16384,
      "hypervisor": { "id": "Hypervisor_Proxmox_VE", "name": "Proxmox VE" },
      "image": "https://picsum.photos/seed/specSupermicro/40/40",
      "service_contract_type": { "id": "ServiceContract_Global_Service", "name": "Global Service" },
      "contact_point_email": "support@supermicro.com",
      "contact_point_phone": "1-408-503-8000",
      "network_cards": [
        { "id": "NetworkCard_100GbE_QSFP28", "name": "100GbE QSFP28" }
      ],
      "plug_power_cords": [
        { "id": "PowerCord_C19_C20", "name": "C19 to C20" }
      ],
      "custom_fields": [
        { "key": "Use Case", "value": "High-Performance Computing" }
      ],
      "created_at": "2023-11-28T14:00:00Z",
      "updated_at": "2023-11-28T14:00:00Z"
    },
    {
      "id": "HW_Dell_Precision_7920",
      "name": "Dell Precision 7920 Tower",
      "hw_type": { "id": "HWType_Workstation", "name": "Workstation" },
      "vendor": "Dell EMC",
      "total_cpu": 56,
      "memory_gb": 192,
      "storage_gb": 4096,
      "hypervisor": { "id": "Hypervisor_None", "name": "None (Bare Metal)" },
      "image": "https://picsum.photos/seed/specPrecision/40/40",
      "service_contract_type": { "id": "ServiceContract_ProSupport_Plus", "name": "ProSupport Plus" },
      "contact_point_email": "prosupport@dell.com",
      "contact_point_phone": "1-800-945-3355",
      "network_cards": [
        { "id": "NetworkCard_10GbE_BaseT", "name": "10GbE BaseT" }
      ],
      "plug_power_cords": [
        { "id": "PowerCord_NEMA_5_15P", "name": "NEMA 5-15P" }
      ],
      "custom_fields": [
        { "key": "Primary User", "value": "dev-lead@example.com" }
      ],
      "created_at": "2023-11-29T15:00:00Z",
      "updated_at": "2023-11-29T15:00:00Z"
    },
    {
      "id": "HW_HPE_Synergy_480",
      "name": "HPE Synergy 480 Gen10",
      "hw_type": { "id": "HWType_Blade", "name": "Blade" },
      "vendor": "HPE",
      "total_cpu": 48,
      "memory_gb": 768,
      "storage_gb": 2048,
      "hypervisor": { "id": "Hypervisor_VMWare_ESXi", "name": "VMWare ESXi" },
      "image": "https://picsum.photos/seed/specSynergy/40/40",
      "service_contract_type": { "id": "ServiceContract_Foundation_Care", "name": "Foundation Care" },
      "contact_point_email": "support@hpe.com",
      "contact_point_phone": "1-800-633-3600",
      "network_cards": [
        { "id": "NetworkCard_Virtual_Connect_SE_40Gb", "name": "Virtual Connect SE 40Gb" }
      ],
      "plug_power_cords": [
        { "id": "PowerCord_Blade_Chassis", "name": "Blade Chassis" }
      ],
      "custom_fields": [
        { "key": "Synergy Frame", "value": "FRAME-B02" },
        { "key": "Profile", "value": "Standard-VM-Host" }
      ],
      "created_at": "2023-11-30T16:00:00Z",
      "updated_at": "2023-11-30T16:00:00Z"
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
        
        // Ensure the ID is unique before inserting
        const existing = await collection.findOne({ id: validatedData.data.id });
        if (existing) {
             return NextResponse.json({ message: `Specification with ID "${validatedData.data.id}" already exists.` }, { status: 409 });
        }
        
        const result = await collection.insertOne(validatedData.data as any);

        const insertedItem = { ...validatedData.data, _id: result.insertedId };


        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

    