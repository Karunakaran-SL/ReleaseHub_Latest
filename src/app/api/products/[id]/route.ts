import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const ProductUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  owner: z.string().optional(),
  owner_email: z.string().email().optional(),
  product_image: z.string().url().optional(),
  approval_needed: z.boolean().optional(),
  default_workflow: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  custom_workflows: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  cmdb: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  compliance_checks: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  deployment_type: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  git_repo: z.string().url().optional(),
  artifacts_repo: z.string().url().optional(),
  pipeline: z.string().url().optional(),
  airgapped_details: z.optional(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
});

// Get a single product by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

        if (!product) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Update a product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
        }

        const body = await req.json();
        const validatedData = ProductUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid product data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const productsCollection = db.collection('products');

        const updateData = { 
            ...validatedData.data,
            updated_at: new Date().toISOString()
        };

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        const updatedProduct = await productsCollection.findOne({ _id: new ObjectId(id) });

        return NextResponse.json(updatedProduct, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete a product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
         if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
