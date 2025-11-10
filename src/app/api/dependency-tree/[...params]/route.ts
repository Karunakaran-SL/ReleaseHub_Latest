
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateDependencyTree } from '@/lib/dependency-graph';

const COLLECTION_NAME = 'dependency_trees';

// GET /api/dependency-tree/[entityType]/[entityId]
export async function GET(req: NextRequest, { params }: { params: { params: string[] } }) {
    const [entityType, entityId] = params.params;
    
    if (!entityType || !entityId) {
        return NextResponse.json({ message: 'Entity Type and Entity ID are required.' }, { status: 400 });
    }
     // For products, the ID is a string like `Product_OSS_Portal`. Other entities use ObjectId.
     if (entityType !== 'product' && !ObjectId.isValid(entityId)) {
        return NextResponse.json({ message: 'Invalid Entity ID format.' }, { status: 400 });
    }

    try {
        let tree = await generateDependencyTree(entityType, entityId);
        
        if (!tree) {
            return NextResponse.json({ message: `Dependency tree could not be generated for ${entityType}:${entityId}.` }, { status: 404 });
        }

        return NextResponse.json(tree, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// PUT /api/dependency-tree/[entityType]/[entityId]
export async function PUT(req: NextRequest, { params }: { params: { params: string[] } }) {
    const [entityType, entityId] = params.params;

     if (!entityType || !entityId) {
        return NextResponse.json({ message: 'Entity Type and Entity ID are required.' }, { status: 400 });
    }
     if (entityType !== 'product' && !ObjectId.isValid(entityId)) {
        return NextResponse.json({ message: 'Invalid Entity ID format.' }, { status: 400 });
    }

     try {
        const tree = await generateDependencyTree(entityType, entityId);

        if (!tree) {
             return NextResponse.json({ message: 'Dependency tree could not be generated.' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Dependency tree revalidated successfully.', tree }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

