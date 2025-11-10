
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/lib/definitions';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';
import { getUser } from '@/lib/auth';
import { revalidateDependencyTree } from '@/lib/dependency-graph';

const initialProducts: Omit<Product, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    "id": "Product_Observability_Platform",
    "name": "Cloud-Native Observability Platform",
    "owner": "SRE Team", "owner_email": "sre@example.com",
    "product_image": "https://picsum.photos/seed/product1/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Flow_2", "name": "Flow 2" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_1", "name": "CMDB 1" },
    "compliance_checks": [{ "id": "Compliance_Security", "name": "Security" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/observability",
    "artifacts_repo": "http://artifacts.example.com/observability",
    "pipeline": "http://pipeline.example.com/observability",
    "specifications": [{ "id": "Spec_Kubernetes_v1.28", "name": "Kubernetes v1.28" }, { "id": "Spec_Prometheus_v2.45", "name": "Prometheus v2.45" }]
  },
  {
    "id": "Product_Developer_Hub",
    "name": "Internal Developer Hub",
    "owner": "DevEx Team", "owner_email": "devex@example.com",
    "product_image": "https://picsum.photos/seed/product2/40/40",
    "approval_needed": false,
    "default_workflow": { "id": "Workflow_Flow_1", "name": "Flow 1" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_1", "name": "CMDB 1" },
    "compliance_checks": [{ "id": "Compliance_IT_Policy", "name": "IT Policy" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/devhub",
    "artifacts_repo": "http://artifacts.example.com/devhub",
    "pipeline": "http://pipeline.example.com/devhub",
    "specifications": [{ "id": "Spec_Backstage_v1.18", "name": "Backstage v1.18" }, { "id": "Spec_ArgoCD_v2.8", "name": "ArgoCD v2.8" }]
  },
  {
    "id": "Product_Data_Analytics_Suite",
    "name": "Data & Analytics Suite",
    "owner": "Data Science Team", "owner_email": "datasci@example.com",
    "product_image": "https://picsum.photos/seed/product3/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Security_Review", "name": "Security Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_2", "name": "CMDB 2" },
    "compliance_checks": [],
    "deployment_type": { "id": "Deployment_OnPrem", "name": "On-Prem" },
    "git_repo": "http://git.example.com/platform/analytics",
    "artifacts_repo": "http://artifacts.example.com/analytics",
    "pipeline": "http://pipeline.example.com/analytics",
    "specifications": [{ "id": "Spec_Spark_v3.4", "name": "Apache Spark v3.4" }, { "id": "Spec_Airflow_v2.7", "name": "Airflow v2.7" }]
  },
  {
    "id": "Product_AI_ML_Workbench",
    "name": "AI/ML Workbench",
    "owner": "AI Research", "owner_email": "ai-research@example.com",
    "product_image": "https://picsum.photos/seed/product4/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Flow_2", "name": "Flow 2" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_2", "name": "CMDB 2" },
    "compliance_checks": [{ "id": "Compliance_Security", "name": "Security" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/ml-workbench",
    "artifacts_repo": "http://artifacts.example.com/ml-workbench",
    "pipeline": "http://pipeline.example.com/ml-workbench",
    "specifications": [{ "id": "Spec_Kubeflow_v1.7", "name": "Kubeflow v1.7" }, { "id": "Spec_SeldonCore_v1.16", "name": "Seldon Core v1.16" }]
  },
  {
    "id": "Product_Edge_Computing_Fabric",
    "name": "Edge Computing Fabric",
    "owner": "IoT Division", "owner_email": "iot@example.com",
    "product_image": "https://picsum.photos/seed/product5/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Security_Review", "name": "Security Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_1", "name": "CMDB 1" },
    "compliance_checks": [{ "id": "Compliance_IT_Policy", "name": "IT Policy" }],
    "deployment_type": { "id": "Deployment_Airgapped", "name": "Airgapped" },
    "git_repo": "http://git.example.com/platform/edge-fabric",
    "artifacts_repo": "http://artifacts.example.com/edge-fabric",
    "pipeline": "http://pipeline.example.com/edge-fabric",
    "specifications": [{ "id": "Spec_K3s_v1.28", "name": "K3s v1.28" }, { "id": "Spec_KubeEdge_v1.14", "name": "KubeEdge v1.14" }]
  }
];


async function seedProducts() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');
    
    await productsCollection.deleteMany({ id: { $in: initialProducts.map(p => p.id) } });

    for (const product of initialProducts) {
        const productWithDates = {
            ...product,
            _id: product.id,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        await productsCollection.insertOne(productWithDates as any);
    }
    console.log('Seeded products collection.');

  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// Search and list products
export async function GET(req: NextRequest) {
  try {
    await seedProducts();
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
  id: z.string(),
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
            _id: validatedData.data.id,
            ...validatedData.data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const result = await productsCollection.insertOne(newProduct as any);
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'product',
            entityId: newProduct.id,
            comment: `Product "${newProduct.name}" created.`,
        });
        
        // Revalidate dependency tree in the background
        revalidateDependencyTree(newProduct.id);


        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
