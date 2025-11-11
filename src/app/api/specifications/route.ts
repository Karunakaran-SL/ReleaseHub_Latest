
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';

const SpecificationSchema = z.object({
  _id: z.string(),
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
  // For Product_OSS_Portal
  { "_id": "Spec_ArgoCD_v2.8", "name": "ArgoCD Sync Spec", "vendor": "CNCF" },
  { "_id": "Spec_SSO_v1.2", "name": "Single Sign-On Spec", "vendor": "OpenID" },
  // For Product_Data_Fabric
  { "_id": "Spec_Spark_v3.5", "name": "Spark Processing", "vendor": "Apache" },
  { "_id": "Spec_Kafka_v3.7", "name": "Kafka Streaming", "vendor": "Apache" },
  // For Product_ML_Platform
  { "_id": "Spec_Kubeflow_v1.8", "name": "Kubeflow Pipelines", "vendor": "Google" },
  { "_id": "Spec_PyTorch_v2.1", "name": "PyTorch Distribution", "vendor": "Facebook" },
  // For Product_Edge_Orchestrator
  { "_id": "Spec_KubeEdge_v1.15", "name": "KubeEdge Node Spec", "vendor": "CNCF" },
  { "_id": "Spec_MQTT_v5.0", "name": "MQTT Broker Spec", "vendor": "OASIS" },
  // For Product_Security_Fabric
  { "_id": "Spec_Istio_v1.20", "name": "Istio Service Mesh", "vendor": "CNCF" },
  { "_id": "Spec_SPIFFE_v1.2", "name": "SPIFFE Identity", "vendor": "CNCF" }
];

const fullSpecifications = initialSpecifications.map(spec => ({
    ...spec,
    hw_type: { "id": "HWType_Virtual", "name": "Virtual" },
    total_cpu: 32, 
    memory_gb: 128, 
    storage_gb: 1024,
    hypervisor: { "id": "Hypervisor_KVM", "name": "KVM" },
    image: `https://picsum.photos/seed/${spec._id}/40/40`,
    service_contract_type: { "id": "ServiceContract_Community", "name": "Community Support" },
    contact_point_email: "community@cncf.io",
    contact_point_phone: "N/A",
    network_cards: [{ "id": "NetworkCard_Virtual_10G", "name": "Virtual NIC 10Gbps" }],
    plug_power_cords: [{ "id": "PowerCord_Virtual", "name": "Virtual Power" }],
    custom_fields: [{ "key": "Managed By", "value": "Platform Team" }],
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString()
}));


async function seedSpecifications() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('specifications');
    
    await collection.insertMany(fullSpecifications as any[]);
    console.log('Seeded specifications collection.');
    
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
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('specifications');
        
        const newItem = {
            ...validatedData.data,
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
