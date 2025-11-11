
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { generateDependencyTree, fetchAllData } from '@/lib/dependency-graph';
import type { Product } from '@/lib/definitions';

// GET /api/dependency-tree/product/[productId]
export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
    const { productId } = params;
    
    if (!productId) {
        return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const product = await db.collection('products').findOne({ _id: productId });

        if (!product) {
            return NextResponse.json({ message: `Product with ID ${productId} not found.` }, { status: 404 });
        }

        const allData = await fetchAllData();
        const tree = await generateDependencyTree(product as any, allData);
        
        if (!tree) {
            return NextResponse.json({ message: `Dependency tree could not be generated for product:${productId}.` }, { status: 404 });
        }

        // Return the stored tree, not the just-generated one, to ensure consistency
        const storedTree = await db.collection('dependency_trees').findOne({ _id: `${productId}_Tree` });
        if (!storedTree) {
             return NextResponse.json({ message: `Stored dependency tree not found for product:${productId}. Please run metrics update.` }, { status: 404 });
        }


        return NextResponse.json(storedTree, { status: 200 });

    } catch (error) {
        console.error(`Error in dependency tree API for product:${productId}`, error);
        return NextResponse.json({ message: 'An internal server error occurred while generating dependency tree.' }, { status: 500 });
    }
}
