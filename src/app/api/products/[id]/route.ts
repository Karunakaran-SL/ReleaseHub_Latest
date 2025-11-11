
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';

const ProductUpdateSchema = z.object({
  _id: z.string().optional(),
  name: z.string().optional(),
  owner: z.string().optional(),
  owner_email: z.string().email().optional(),
  product_image: z.string().url().optional().nullable(),
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
  git_repo: z.string().url().optional().nullable(),
  artifacts_repo: z.string().url().optional().nullable(),
  pipeline: z.string().url().optional().nullable(),
  specifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  updateComment: z.string().min(1, 'Update comment is required.'),
});

// Get a single product by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();
        const product = await db.collection('products').findOne({ _id: id });

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
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const body = await req.json();
        const validatedData = ProductUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid product data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const productsCollection = db.collection('products');

        const { updateComment, ...productData } = validatedData.data;

        const updateData = { 
            ...productData,
            updated_at: new Date().toISOString()
        };

        const result = await productsCollection.updateOne(
            { _id: id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'UPDATE',
            entity: 'product',
            entityId: id,
            comment: updateComment,
        });
        
        // Revalidate dependency tree in the background
        await generateAndStoreAllProductTrees();


        const updatedProduct = await productsCollection.findOne({ _id: id });

        return NextResponse.json(updatedProduct, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Delete a product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        
        const { comment } = await req.json();
        if (!comment) {
            return NextResponse.json({ message: 'Delete comment is required.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection('products').deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        await logAuditEvent({
            action: 'DELETE',
            entity: 'product',
            entityId: id,
            comment,
        });
        
        // Since the product is deleted, we can remove its dependency tree
        await db.collection('dependency_trees').deleteOne({ _id: `${id}_Tree` });


        return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
