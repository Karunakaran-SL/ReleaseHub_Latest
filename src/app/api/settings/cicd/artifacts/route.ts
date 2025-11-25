
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const ArtifactRepoSchema = z.union([
    z.object({
        type: z.literal('jfrog'),
        url: z.string().url(),
        apiKey: z.string().min(1)
    }),
    z.object({
        type: z.literal('nexus'),
        url: z.string().url(),
        username: z.string().min(1),
        password: z.string().min(1)
    }),
]);

const COLLECTION_NAME = 'cicd_integrations';

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = ArtifactRepoSchema.safeParse(body);

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
            comment: `Updated Artifacts configuration for ${type}.`,
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
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const types = ['jfrog', 'nexus'];
        const client = await clientPromise;
        const db = client.db();
        const items = await db.collection(COLLECTION_NAME).find({ type: { $in: types } }).toArray();

        const safeItems = items.map(item => {
            const { apiKey, password, ...safeItem } = item;
            return safeItem;
        });

        return NextResponse.json(safeItems, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
