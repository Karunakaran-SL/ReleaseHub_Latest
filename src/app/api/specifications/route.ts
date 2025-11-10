
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
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
    // Specs for Product_Observability_Platform
    { "id": "Spec_Kubernetes_v1.28", "name": "Kubernetes v1.28", "vendor": "CNCF" },
    { "id": "Spec_Prometheus_v2.45", "name": "Prometheus v2.45", "vendor": "CNCF" },
    // Specs for Product_Developer_Hub
    { "id": "Spec_Backstage_v1.18", "name": "Backstage v1.18", "vendor": "CNCF" },
    { "id": "Spec_ArgoCD_v2.8", "name": "ArgoCD v2.8", "vendor": "CNCF" },
    // Specs for Product_Data_Analytics_Suite
    { "id": "Spec_Spark_v3.4", "name": "Apache Spark v3.4", "vendor": "Apache" },
    { "id": "Spec_Airflow_v2.7", "name": "Airflow v2.7", "vendor": "Apache" },
    // Specs for Product_AI_ML_Workbench
    { "id": "Spec_Kubeflow_v1.7", "name": "Kubeflow v1.7", "vendor": "Google" },
    { "id": "Spec_SeldonCore_v1.16", "name": "Seldon Core v1.16", "vendor": "Seldon" },
    // Specs for Product_Edge_Computing_Fabric
    { "id": "Spec_K3s_v1.28", "name": "K3s v1.28", "vendor": "CNCF" },
    { "id": "Spec_KubeEdge_v1.14", "name": "KubeEdge v1.14", "vendor": "CNCF" }
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
        
        const existing = await collection.findOne({ id: validatedData.data.id });
        if (existing) {
             return NextResponse.json({ message: `Specification with ID "${validatedData.data.id}" already exists.` }, { status: 409 });
        }
        
        const result = await collection.insertOne({_id: validatedData.data.id, ...validatedData.data} as any);
        const insertedItem = { ...validatedData.data, _id: result.insertedId };
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'specification',
            entityId: result.insertedId.toString(),
            comment: `Specification "${insertedItem.name}" created.`,
        });

        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
