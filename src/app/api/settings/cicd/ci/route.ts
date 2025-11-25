
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

// Define schemas for each CI tool you support
const JenkinsSchema = z.object({
  type: z.literal('jenkins'),
  instanceUrl: z.string().url(),
  username: z.string(),
  apiToken: z.string(),
});

const GitLabCiSchema = z.object({
    type: z.literal('gitlab'),
    // Assuming GitLab CI uses the same config as SCM for simplicity
    instanceUrl: z.string().url(),
    accessToken: z.string(),
});

const GitHubActionsSchema = z.object({
    type: z.literal('github-actions'),
    // PAT might be stored under the 'github' SCM config
});

const CircleCiSchema = z.object({
    type: z.literal('circleci'),
    apiToken: z.string(),
});

const CiConfigSchema = z.union([JenkinsSchema, GitLabCiSchema, GitHubActionsSchema, CircleCiSchema]);

const COLLECTION_NAME = 'cicd_integrations';

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = CiConfigSchema.safeParse(body);

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
            comment: `Updated CI configuration for ${type}.`,
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
        
        const ciTypes = ['jenkins', 'gitlab', 'github-actions', 'circleci'];

        const client = await clientPromise;
        const db = client.db();
        const items = await db.collection(COLLECTION_NAME).find({ type: { $in: ciTypes } }).toArray();

        // Omit sensitive fields
        const safeItems = items.map(item => {
            const { apiToken, accessToken, ...safeItem } = item;
            return safeItem;
        });

        return NextResponse.json(safeItems, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
