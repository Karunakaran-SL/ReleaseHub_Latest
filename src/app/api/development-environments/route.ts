import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';
import { deployPlatformComponents, deployTenantComponents } from '@/lib/k8s-deployer';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'development_environments';

// List all development environments
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
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new development environment
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Basic validation can be added here with Zod if needed

    const client = await clientPromise;
    const db = client.db();

    const newItem = {
      ...body,
      createdBy: user.username,
      createdAt: new Date().toISOString(),
      status: 'PROVISIONING', // Initial status
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newItem as any);

    const finalItem = { ...newItem, _id: result.insertedId };

    // Real-time Kubernetes logic for Managed K8s
    const spec = await db.collection('specifications').findOne({ _id: body.specificationId });
    const foundation = await db.collection('platform_foundations').findOne({ _id: body.foundationId });
    const baseline = body.baselineId ? await db.collection('baselines').findOne({ _id: body.baselineId }) : null;

    if (spec && spec.clusterType === 'Managed Kubernetes' && spec.managedConfig?.apiUrl && spec.managedConfig?.token) {
      try {
        const decryptedToken = decrypt(spec.managedConfig.token);
        const foundationNamespace = `${body.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-platform-foundation`;
        const allLogs: any[] = [];

        // 1. Deploy Platform Foundation
        const foundationLogs = await deployPlatformComponents(
          { apiUrl: spec.managedConfig.apiUrl, token: decryptedToken },
          foundationNamespace,
          foundation?.kubernetes?.platformComponents || []
        );
        allLogs.push(...foundationLogs);

        // 2. Deploy Tenants from Baseline (if any)
        if (baseline && baseline.tenants) {
          for (const tenant of baseline.tenants) {
            const tenantLogs = await deployTenantComponents(
              { apiUrl: spec.managedConfig.apiUrl, token: decryptedToken },
              body.name,
              tenant
            );
            allLogs.push(...tenantLogs);
          }
        }

        const overallStatus = allLogs.some(l => l.status === 'Failed') ? 'DEGRADED' : 'ACTIVE';

        await db.collection(COLLECTION_NAME).updateOne(
          { _id: result.insertedId },
          {
            $set: {
              status: overallStatus,
              kubernetesNamespace: foundationNamespace,
              deploymentLogs: allLogs
            }
          }
        );
        finalItem.status = overallStatus;
        finalItem.deploymentLogs = allLogs;
      } catch (k8sError: any) {
        console.error("K8s Deployment Failed:", k8sError);
        await db.collection(COLLECTION_NAME).updateOne(
          { _id: result.insertedId },
          { $set: { status: 'FAILED', error: k8sError.message } }
        );
        finalItem.status = 'FAILED';
      }
    }

    return NextResponse.json(finalItem, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
