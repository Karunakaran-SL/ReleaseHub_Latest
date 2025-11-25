
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const CicdContainerRegistrySchema = z.object({
  type: z.string(),
  url: z.string().optional(), // Not all have a specific URL (e.g. Docker Hub)
  username: z.string(),
  token: z.string(), // Could be password or PAT
});

const COLLECTION_NAME = 'cicd_integrations';

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = CicdContainerRegistrySchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const { type, ...configData } = validatedData.data;

        await db.collection(COLLECTION_NAME).updateOne(
            { type: type },
            { $set: configData },
            { upsert: true }
        );
        
        await logAuditEvent({
            action: 'UPDATE',
            entity: 'cicd_configuration',
            entityId: type,
            comment: `Updated Container Registry configuration for ${type}.`,
        });

        return NextResponse.json({ message: 'Configuration saved successfully' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
