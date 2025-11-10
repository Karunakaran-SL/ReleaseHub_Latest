
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { generateDependencyTree } from '@/lib/dependency-graph';
import type { Product } from '@/lib/definitions';

export async function POST(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const productsCollection = db.collection<Product>('products');
        const dependencyTreesCollection = db.collection('dependency_trees');

        const products = await productsCollection.find({}).toArray();

        if (!products.length) {
            return NextResponse.json({ message: 'No products found to generate metrics for.' }, { status: 404 });
        }
        
        let successfulUpdates = 0;
        let failedUpdates = 0;

        for (const product of products) {
            try {
                const tree = await generateDependencyTree('product', product._id);
                if (tree) {
                    await dependencyTreesCollection.updateOne(
                        { _id: product.id },
                        { $set: tree },
                        { upsert: true }
                    );
                    successfulUpdates++;
                } else {
                    failedUpdates++;
                }
            } catch (error) {
                console.error(`Failed to generate tree for product ${product.id}:`, error);
                failedUpdates++;
            }
        }

        return NextResponse.json({ 
            message: `Dependency metrics updated.`,
            successfulUpdates,
            failedUpdates,
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating dependency metrics:', error);
        return NextResponse.json({ message: 'An internal server error occurred while updating metrics.' }, { status: 500 });
    }
}
