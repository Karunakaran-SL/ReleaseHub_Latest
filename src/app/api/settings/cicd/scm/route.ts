
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const SCMConfigSchema = z.union([
    z.object({
        type: z.literal('github'),
        pat: z.string().min(1),
        includePublicRepos: z.boolean().default(false),
    }),
    z.object({
        type: z.literal('gitlab'),
        instanceUrl: z.string().url(),
        accessToken: z.string().min(1)
    }),
    z.object({
        type: z.literal('bitbucket'),
        instanceUrl: z.string().url().optional(),
        username: z.string().min(1),
        appPassword: z.string().min(1)
    })
]);

const COLLECTION_NAME = 'cicd_integrations';

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = SCMConfigSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid data', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const { type, ...configData } = validatedData.data;

        // Note: In a real production app, secrets like 'pat', 'accessToken', and 'appPassword'
        // should be encrypted before being stored in the database.
        await db.collection(COLLECTION_NAME).updateOne(
            { type: type },
            { $set: configData },
            { upsert: true }
        );
        
        await logAuditEvent({
            action: 'UPDATE',
            entity: 'cicd_configuration',
            entityId: type,
            comment: `Updated Source Code Management configuration for ${type}.`,
        });

        return NextResponse.json({ message: 'Configuration saved successfully' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
     try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const scmTypes = ['github', 'gitlab', 'bitbucket'];

        const client = await clientPromise;
        const db = client.db();
        const items = await db.collection(COLLECTION_NAME).find({ type: { $in: scmTypes } }).toArray();

        // Omit sensitive fields
        const safeItems = items.map(item => {
            const { pat, accessToken, appPassword, ...safeItem } = item;
            return safeItem;
        });

        return NextResponse.json(safeItems, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
