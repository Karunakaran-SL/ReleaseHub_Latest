
import { NextRequest, NextResponse } from 'next/server';
import { generateDependencyTree } from '@/lib/dependency-graph';

// GET /api/dependency-tree/[entityType]/[entityId]
export async function GET(req: NextRequest, { params }: { params: { params: string[] } }) {
    const [entityType, entityId] = params.params;
    
    if (!entityType || !entityId) {
        return NextResponse.json({ message: 'Entity Type and Entity ID are required.' }, { status: 400 });
    }

    try {
        let tree = await generateDependencyTree(entityType, entityId);
        
        if (!tree) {
            return NextResponse.json({ message: `Dependency tree could not be generated for ${entityType}:${entityId}.` }, { status: 404 });
        }

        return NextResponse.json(tree, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred while generating dependency tree.' }, { status: 500 });
    }
}
