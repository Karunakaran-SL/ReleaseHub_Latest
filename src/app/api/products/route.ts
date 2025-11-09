import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/lib/definitions';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

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
    
    // Delete all existing documents
    await productsCollection.deleteMany({});
    
    // Insert the new data
    await productsCollection.insertMany(initialProducts as any);
    console.log('Cleared and re-seeded products collection.');

  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// Search and list products
export async function GET(req: NextRequest) {
  try {
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
        const count = await productsCollection.countDocuments();
        if (count === 0) {
            await seedProducts();
        }
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
  airgapped_details: z.optional(z.object({
    id: z.string(),
    name: z.string(),
  })),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});


// Create a new product
export async function POST(req: NextRequest) {
    try {
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
        const insertedProduct = { ...newProduct, _id: result.insertedId };


        return NextResponse.json(insertedProduct, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
