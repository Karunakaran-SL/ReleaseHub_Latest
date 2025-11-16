
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import type { OnboardingPhase } from '@/lib/definitions';

const OnboardingFieldSchema = z.object({
  type: z.enum(['Checkbox', 'RadioBox', 'TextField', 'DropDown', 'Link']),
  name: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
  helpText: z.string().optional(),
  proof: z.boolean().optional(),
  proofLink: z.string().optional(),
  value: z.any().optional(),
});

const OnboardingPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerName: z.string().optional().nullable(),
  ownerEmail: z.string().optional().nullable(),
  sendEmailOnComplete: z.boolean().optional(),
  statusOptions: z.array(z.string()),
  fields: z.array(OnboardingFieldSchema),
  status: z.string().optional(),
});


const UpgradeHistorySchema = z.object({
  deploymentIds: z.array(z.string()).min(1),
  productId: z.string(),
  targetSpecificationId: z.string(),
  upgradeScope: z.enum(['baseline', 'individual']),
  baselineId: z.string().optional(),
  releaseNotes: z.string(),
  fieldOperations: z.string().optional(),
  maintenanceWindow: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  approvers: z.array(z.string()),
  approval_phases: z.array(OnboardingPhaseSchema).optional(),
  status: z.enum(['SCHEDULED', 'APPROVAL_IN_PROGRESS']).optional().default('SCHEDULED'),
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
      initiatedBy: user.username,
      initiatedAt: new Date().toISOString(),
      reportUploadUrl: `/var/deploy/reports/upgrades/${deploymentId}-${upgradeDetails.targetSpecificationId}.json`,
      summary: {
          deploymentId: deploymentId,
          status: upgradeDetails.status,
          packageLocation: `/var/deploy/upgrades/${deploymentId}-${upgradeDetails.targetSpecificationId}.tar.gz`,
          targetSpecificationId: upgradeDetails.targetSpecificationId
      }
    }));

    await historyCollection.insertMany(newHistoryEntries as any[]);

    if (upgradeDetails.status === 'SCHEDULED') {
        await deploymentsCollection.updateMany(
            { _id: { $in: deploymentIds } },
            { $set: { status: 'UPGRADING' } }
        );
        for (const deploymentId of deploymentIds) {
            await logAuditEvent({
                action: 'UPDATE',
                entity: 'deployment',
                entityId: deploymentId,
                comment: `Upgrade to spec ${upgradeDetails.targetSpecificationId} scheduled. Status changed to UPGRADING.`,
            });
        }
    } else if (upgradeDetails.status === 'APPROVAL_IN_PROGRESS') {
         await deploymentsCollection.updateMany(
            { _id: { $in: deploymentIds } },
            { $set: { status: 'UPGRADE_APPROVAL' } }
        );
         for (const deploymentId of deploymentIds) {
            await logAuditEvent({
                action: 'UPDATE',
                entity: 'deployment',
                entityId: deploymentId,
                comment: `Upgrade to spec ${upgradeDetails.targetSpecificationId} is pending approval. Status changed to UPGRADE_APPROVAL.`,
            });
        }
    }


    return NextResponse.json({ 
        message: `Successfully processed upgrade for ${deploymentIds.length} deployments.`,
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// GET all upgrade histories, grouped by operation
export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const history = await db.collection('upgrade_history').find({}).sort({ initiatedAt: -1 }).toArray();

        // Group by a composite key of initiatedAt and productId to identify a single upgrade operation
        const groupedByOperation = history.reduce((acc, entry) => {
            const key = `${entry.initiatedAt}-${entry.productId}-${entry.targetSpecificationId}`;
            if (!acc[key]) {
                acc[key] = {
                    ...entry,
                    deploymentIds: [entry.deploymentId],
                };
                delete acc[key].deploymentId;
            } else {
                acc[key].deploymentIds.push(entry.deploymentId);
            }
            return acc;
        }, {} as Record<string, any>);

        const results = Object.values(groupedByOperation);

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('Error fetching upgrade history:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
