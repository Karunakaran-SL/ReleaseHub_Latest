
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const collectionsToClear = [
    'products',
    'cmdb_tenants',
    'cmdb_components',
    'cmdb_applications',
    'cmdb_interfaces',
    'cmdb_interface_types',
    'specifications',
    'audits',
    'baselines',
    'dependency_trees',
    'workflows',
    'compliance_checks',
    'deployment_types',
    'cmdb',
    'deployments'
];

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        let clearedCollections = [];
        let failedCollections = [];

        for (const collectionName of collectionsToClear) {
            try {
                await db.collection(collectionName).deleteMany({});
                clearedCollections.push(collectionName);
            } catch (error) {
                console.error(`Failed to clear collection ${collectionName}:`, error);
                failedCollections.push(collectionName);
            }
        }

        if (failedCollections.length > 0) {
             return NextResponse.json({ 
                message: `Completed with errors. Cleared: ${clearedCollections.join(', ')}. Failed: ${failedCollections.join(', ')}.` 
            }, { status: 500 });
        }

        return NextResponse.json({ message: `Successfully cleared all data from tables.` }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
