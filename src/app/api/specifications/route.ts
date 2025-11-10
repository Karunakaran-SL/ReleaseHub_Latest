
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';

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
  // For Product_OSS_Portal
  { "id": "Spec_ArgoCD_v2.8", "name": "ArgoCD Sync Spec", "version": "2.8", "vendor": "CNCF" },
  { "id": "Spec_SSO_v1.2", "name": "Single Sign-On Spec", "version": "1.2", "vendor": "OpenID" },
  // For Product_Data_Fabric
  { "id": "Spec_Spark_v3.5", "name": "Spark Processing", "version": "3.5", "vendor": "Apache" },
  { "id": "Spec_Kafka_v3.7", "name": "Kafka Streaming", "version": "3.7", "vendor": "Apache" },
  // For Product_ML_Platform
  { "id": "Spec_Kubeflow_v1.8", "name": "Kubeflow Pipelines", "version": "1.8", "vendor": "Google" },
  { "id": "Spec_PyTorch_v2.1", "name": "PyTorch Distribution", "version": "2.1", "vendor": "Facebook" },
  // For Product_Edge_Orchestrator
  { "id": "Spec_KubeEdge_v1.15", "name": "KubeEdge Node Spec", "version": "1.15", "vendor": "CNCF" },
  { "id": "Spec_MQTT_v5.0", "name": "MQTT Broker Spec", "version": "5.0", "vendor": "OASIS" },
  // For Product_Security_Fabric
  { "id": "Spec_Istio_v1.20", "name": "Istio Service Mesh", "version": "1.20", "vendor": "CNCF" },
  { "id": "Spec_SPIFFE_v1.2", "name": "SPIFFE Identity", "version": "1.2", "vendor": "CNCF" }
];

const fullSpecifications = initialSpecifications.map(spec => ({
    ...spec,
    _id: spec.id,
    hw_type: { "id": "HWType_Virtual", "name": "Virtual" },
    total_cpu: 32, "memory_gb": 128, "storage_gb": 1024,
    hypervisor: { "id": "Hypervisor_KVM", "name": "KVM" },
    image: `https://picsum.photos/seed/${spec.id}/40/40`,
    service_contract_type: { "id": "ServiceContract_Community", "name": "Community Support" },
    contact_point_email": "community@cncf.io", "contact_point_phone": "N/A",
    network_cards: [{ "id": "NetworkCard_Virtual", "name": "Virtual NIC" }],
    plug_power_cords: [{ "id": "PowerCord_Virtual", "name": "Virtual" }],
    custom_fields: [{ "key": "Managed By", "value": "Platform Team" }],
    created_at: new Date().toISOString(), "updated_at": new Date().toISOString()
}));


async function seedSpecifications() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('specifications');
    
    await collection.deleteMany({ id: { $in: fullSpecifications.map(i => i.id) } });
    await collection.insertMany(fullSpecifications as any[]);
    console.log('Seeded specifications collection.');
    
  } catch (error) {
    console.error('Error seeding specifications:', error);
  }
}

// List all or search
export async function GET(req: NextRequest) {
  try {
    await seedSpecifications();
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
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('specifications');
        
        const newItem = {
            ...validatedData.data,
            _id: validatedData.data.id,
        };

        const existing = await collection.findOne({ _id: newItem._id });
        if (existing) {
             return NextResponse.json({ message: `Specification with ID "${newItem.id}" already exists.` }, { status: 409 });
        }
        
        await collection.insertOne(newItem as any);
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'specification',
            entityId: newItem.id,
            comment: `Specification "${newItem.name}" created.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
