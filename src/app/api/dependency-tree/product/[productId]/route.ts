import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/dependency-tree/product/[productId]
export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
    const { productId } = params;
    
    if (!productId) {
        return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        
        // Directly fetch the pre-generated tree from the 'dependency_trees' collection.
        // The tree's _id is stored as '{productId}_Tree'.
        const storedTree = await db.collection('dependency_trees').findOne({ _id: `${productId}_Tree` });
        
        if (!storedTree) {
             return NextResponse.json({ message: `Stored dependency tree not found for product:${productId}. Please run metrics update from the 'Dependency Metrics' page.` }, { status: 404 });
        }

        return NextResponse.json(storedTree, { status: 200 });

    } catch (error) {
        console.error(`Error in dependency tree API for product:${productId}`, error);
        return NextResponse.json({ message: 'An internal server error occurred while fetching the dependency tree.' }, { status: 500 });
    }
}
