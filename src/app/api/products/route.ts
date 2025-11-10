
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/lib/definitions';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';

const initialProducts: Omit<Product, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    "name": "OneStopShop Portal",
    "owner": "Platform Engineering", "owner_email": "platform@example.com",
    "product_image": "https://picsum.photos/seed/product1/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Standard_Approval", "name": "Standard Approval" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "Compliance_SOC2", "name": "SOC2" }, { "id": "Compliance_GDPR", "name": "GDPR" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/oss-portal",
    "artifacts_repo": "http://artifacts.example.com/oss-portal",
    "pipeline": "http://cicd.example.com/oss-portal",
    "specifications": [{ "id": "Spec_ArgoCD_v2.8", "name": "ArgoCD Sync Spec" }, { "id": "Spec_SSO_v1.2", "name": "Single Sign-On Spec" }]
  },
  {
    "name": "Unified Data Fabric",
    "owner": "Data Platform Team", "owner_email": "data-platform@example.com",
    "product_image": "https://picsum.photos/seed/product2/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Data_Governance", "name": "Data Governance Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "Compliance_HIPAA", "name": "HIPAA" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/data-fabric",
    "artifacts_repo": "http://artifacts.example.com/data-fabric",
    "pipeline": "http://cicd.example.com/data-fabric",
    "specifications": [{ "id": "Spec_Spark_v3.5", "name": "Spark Processing" }, { "id": "Spec_Kafka_v3.7", "name": "Kafka Streaming" }]
  },
  {
    "name": "AI/ML Workbench",
    "owner": "AI Research Group", "owner_email": "ai-research@example.com",
    "product_image": "https://picsum.photos/seed/product3/40/40",
    "approval_needed": false,
    "default_workflow": { "id": "Workflow_Standard_Approval", "name": "Standard Approval" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/ml-workbench",
    "artifacts_repo": "http://artifacts.example.com/ml-workbench",
    "pipeline": "http://cicd.example.com/ml-workbench",
    "specifications": [{ "id": "Spec_Kubeflow_v1.8", "name": "Kubeflow Pipelines" }, { "id": "Spec_PyTorch_v2.1", "name": "PyTorch Distribution" }]
  },
  {
    "name": "Edge Computing Orchestrator",
    "owner": "IoT Division", "owner_email": "iot@example.com",
    "product_image": "https://picsum.photos/seed/product4/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Hardware_Review", "name": "Hardware Compatibility Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Edge", "name": "Edge CMDB" },
    "compliance_checks": [{ "id": "Compliance_FedRAMP", "name": "FedRAMP" }],
    "deployment_type": { "id": "Deployment_Airgapped", "name": "Airgapped" },
    "git_repo": "http://git.example.com/platform/edge-orchestrator",
    "artifacts_repo": "http://artifacts.example.com/edge-orchestrator",
    "pipeline": "http://cicd.example.com/edge-orchestrator",
    "specifications": [{ "id": "Spec_KubeEdge_v1.15", "name": "KubeEdge Node Spec" }, { "id": "Spec_MQTT_v5.0", "name": "MQTT Broker Spec" }]
  },
  {
    "name": "Zero-Trust Security Fabric",
    "owner": "Cybersecurity Office", "owner_email": "security@example.com",
    "product_image": "https://picsum.photos/seed/product5/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Security_Review", "name": "Peer Security Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "Compliance_SOC2", "name": "SOC2" }, { "id": "Compliance_FedRAMP", "name": "FedRAMP" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/security-fabric",
    "artifacts_repo": "http://artifacts.example.com/security-fabric",
    "pipeline": "http://cicd.example.com/security-fabric",
    "specifications": [{ "id": "Spec_Istio_v1.20", "name": "Istio Service Mesh" }, { "id": "Spec_SPIFFE_v1.2", "name": "SPIFFE Identity" }]
  }
];

async function seedProducts() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');
    
    const productsWithDates = initialProducts.map(product => {
      const id = `Product_${product.name.replace(/\s+/g, '_')}`;
      return {
        ...product,
        _id: id,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    });
    
    await productsCollection.deleteMany({ _id: { $in: productsWithDates.map(p => p._id) } });
    await productsCollection.insertMany(productsWithDates as any[]);
    console.log('Seeded products collection.');

  } catch (error) {
    console.error('Error seeding products:', error);
  }
}


// Search and list products
export async function GET(req: NextRequest) {
  try {
    await seedProducts();
    await generateAndStoreAllProductTrees();
    
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    let products;
    if (query) {
        products = await productsCollection.find({ 
            name: { $regex: query, $options: 'i' } 
        }).toArray();
    } else {
        products = await productsCollection.find({}).toArray();
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create Product Schema (without _id)
const ProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  owner: z.string(),
  owner_email: z.string().email(),
  product_image: z.string().url(),
  approval_needed: z.boolean(),
  default_workflow: z.object({
    id: z.string(),
    name: z.string(),
  }),
  custom_workflows: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  cmdb: z.object({
    id: z.string(),
    name: z.string(),
  }),
  compliance_checks: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  deployment_type: z.object({
    id: z.string(),
    name: z.string(),
  }),
  git_repo: z.string().url(),
  artifacts_repo: z.string().url(),
  pipeline: z.string().url(),
  specifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
});


// Create a new product
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = ProductSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid product data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const productsCollection = db.collection('products');
        
        const newProduct = {
            ...validatedData.data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const result = await productsCollection.insertOne(newProduct as any);
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'product',
            entityId: newProduct._id,
            comment: `Product "${newProduct.name}" created.`,
        });
        
        // Revalidate dependency tree in the background
        await generateAndStoreAllProductTrees();


        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
