import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const initialProducts = [
  {
    icon: 'product-a',
    productName: 'Product A',
    owner: 'John Doe',
    deploymentType: 'Cloud',
    deployments: 5,
  },
  {
    icon: 'product-b',
    productName: 'Product B',
    owner: 'Jane Smith',
    deploymentType: 'Airgapped',
    deployments: 3,
  },
  {
    icon: 'product-c',
    productName: 'Product C',
    owner: 'Peter Jones',
    deploymentType: 'On-Prem',
    deployments: 10,
  },
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
