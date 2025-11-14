
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const UpgradeHistorySchema = z.object({
  deploymentIds: z.array(z.string()).min(1),
  productId: z.string(),
  targetSpecificationId: z.string(),
  upgradeScope: z.enum(['baseline', 'individual']),
  releaseNotes: z.string(),
  fieldOperations: z.string().optional(),
  maintenanceWindow: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  approvers: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = UpgradeHistorySchema.safeParse(body);

    if (!validatedData.success) {
      console.error("Validation errors:", validatedData.error.flatten().fieldErrors);
      return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
    }

    const { deploymentIds, ...upgradeDetails } = validatedData.data;

    const client = await clientPromise;
    const db = client.db();
    const deploymentsCollection = db.collection('deployments');
    const historyCollection = db.collection('upgrade_history');

    const newHistoryEntries = deploymentIds.map(deploymentId => ({
      ...upgradeDetails,
      deploymentId,
      status: 'SCHEDULED',
      initiatedBy: user.username,
      initiatedAt: new Date().toISOString(),
    }));

    await historyCollection.insertMany(newHistoryEntries as any[]);

    const updateResult = await deploymentsCollection.updateMany(
      { _id: { $in: deploymentIds } },
      { $set: { status: 'UPGRADING' } }
    );
    
    // Fire off audit events for each deployment
    for (const deploymentId of deploymentIds) {
        await logAuditEvent({
            action: 'UPDATE',
            entity: 'deployment',
            entityId: deploymentId,
            comment: `Upgrade to spec ${upgradeDetails.targetSpecificationId} scheduled. Status changed to UPGRADING.`,
        });
    }

    return NextResponse.json({ 
        message: `Successfully scheduled upgrade for ${deploymentIds.length} deployments.`,
        updatedCount: updateResult.modifiedCount,
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
