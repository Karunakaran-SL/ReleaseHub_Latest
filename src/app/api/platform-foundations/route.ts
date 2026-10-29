
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';
import { deployPlatformComponents } from '@/lib/k8s-deployer';

const COLLECTION_NAME = 'platform_foundations';

// GET all platform foundations
export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const items = await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray();

        return NextResponse.json(items, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch platform foundations:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// Create a new platform foundation
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Basic validation
        if (!body.name || !body.specification) {
            return NextResponse.json({ message: 'Invalid data. Name and specification are required.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const newItem = {
            ...body,
            _id: `${body.name.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
            createdBy: user.username,
            createdAt: new Date().toISOString(),
        };

        await db.collection(COLLECTION_NAME).insertOne(newItem as any);
        const finalItem = { ...newItem };

        // Real-time Kubernetes logic for Managed K8s
        const spec = body.specification;
        if (spec && spec.clusterType === 'Managed Kubernetes' && spec.managedConfig?.apiUrl && spec.managedConfig?.token) {
            try {
                const decryptedToken = decrypt(spec.managedConfig.token);
                const namespace = 'platform-foundation';

                const deploymentResults = await deployPlatformComponents(
                    { apiUrl: spec.managedConfig.apiUrl, token: decryptedToken },
                    namespace,
                    body.kubernetes?.platformComponents || []
                );

                await db.collection(COLLECTION_NAME).updateOne(
                    { _id: newItem._id },
                    {
                        $set: {
                            status: 'ACTIVE',
                            kubernetesNamespace: namespace,
                            deploymentMetadata: deploymentResults
                        }
                    }
                );
                finalItem.status = 'ACTIVE';
            } catch (k8sError: any) {
                console.error("Platform Foundation Deployment Failed:", k8sError);
                await db.collection(COLLECTION_NAME).updateOne(
                    { _id: newItem._id },
                    { $set: { status: 'FAILED', error: k8sError.message } }
                );
                finalItem.status = 'FAILED';
            }
        }

        return NextResponse.json(finalItem, { status: 201 });

    } catch (error) {
        console.error('Failed to create platform foundation:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
