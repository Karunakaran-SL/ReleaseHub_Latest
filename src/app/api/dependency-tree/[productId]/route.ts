
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateDependencyTree } from '@/lib/dependency-graph';

const COLLECTION_NAME = 'dependency_trees';

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
    try {
        const { productId } = params;
        if (!ObjectId.isValid(productId)) {
            return NextResponse.json({ message: 'Invalid Product ID.' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(COLLECTION_NAME);
        
        let tree = await collection.findOne({ productId });

        if (!tree) {
             // If not found, generate it on-the-fly and return
            tree = await generateDependencyTree(productId);
            if (!tree) {
                 return NextResponse.json({ message: 'Dependency tree could not be generated for this product.' }, { status: 404 });
            }
        }

        return NextResponse.json(tree, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// This endpoint is for triggering a rebuild of the tree
export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
     try {
        const { productId } = params;
        if (!ObjectId.isValid(productId)) {
            return NextResponse.json({ message: 'Invalid Product ID.' }, { status: 400 });
        }
        
        const tree = await generateDependencyTree(productId);

        if (!tree) {
             return NextResponse.json({ message: 'Dependency tree could not be generated for this product.' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Dependency tree revalidated successfully.', tree }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500