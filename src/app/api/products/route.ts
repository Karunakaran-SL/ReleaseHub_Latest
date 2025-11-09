import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/lib/definitions';

const initialProducts: Omit<Product, '_id'>[] = [
  {
    "id": "Product_A",
    "name": "OneStopShop Portal",
    "owner": "Admin User",
    "owner_email": "admin@onestopshop.com",
    "product_image": "https://picsum.photos/seed/productA/40/40",
    "approval_needed": true,
    "default_workflow": {
      "id": "Workflow_Flow_2",
      "name": "Flow 2"
    },
    "custom_workflows": [
      { "id": "Workflow_Flow_1", "name": "Flow 1" },
      { "id": "Workflow_Security_Review", "name": "Security Review" }
    ],
    "cmdb": {
      "id": "CMDB_1",
      "name": "CMDB 1"
    },
    "compliance_checks": [
      { "id": "Compliance_Security", "name": "Security" },
      { "id": "Compliance_IT_Policy", "name": "IT Policy" }
    ],
    "deployment_type": {
      "id": "Deployment_Airgapped",
      "name": "Airgapped"
    },
    "git_repo": "http://git.example.com/onestopshop-portal",
    "artifacts_repo": "http://artifacts.example.com/onestopshop-portal",
    "pipeline": "http://pipeline.example.com/onestopshop-portal",
    "airgapped_details": {
      "id": "Airgapped_Details_1",
      "name": "Airgapped Details 1"
    },
    "created_at": "2023-11-20T09:00:00Z",
    "updated_at": "2023-11-20T09:00:00Z"
  },
    {
    "id": "Product_B",
    "name": "Data Analytics Platform",
    "owner": "Data Team",
    "owner_email": "data@onestopshop.com",
    "product_image": "https://picsum.photos/seed/productB/40/40",
    "approval_needed": false,
    "default_workflow": {
      "id": "Workflow_Flow_1",
      "name": "Flow 1"
    },
    "custom_workflows": [],
    "cmdb": {
      "id": "CMDB_2",
      "name": "CMDB 2"
    },
    "compliance_checks": [
      { "id": "Compliance_IT_Policy", "name": "IT Policy" }
    ],
    "deployment_type": {
      "id": "Deployment_Cloud",
      "name": "Cloud"
    },
    "git_repo": "http://git.example.com/data-analytics",
    "artifacts_repo": "http://artifacts.example.com/data-analytics",
    "pipeline": "http://pipeline.example.com/data-analytics",
    "created_at": "2023-10-15T14:30:00Z",
    "updated_at": "2023-11-21T11:00:00Z"
  }
];


async function seedProducts() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');
    const count = await productsCollection.countDocuments();
    if (count === 0) {
      await productsCollection.insertMany(initialProducts as any);
      console.log('Seeded products collection.');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

export async function GET(req: NextRequest) {
  try {
    await seedProducts();
    const client = await clientPromise;
    const db = client.db();
    const products = await db.collection('products').find({}).toArray();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
