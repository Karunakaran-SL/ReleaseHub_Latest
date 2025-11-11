
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import type { OnboardingConfiguration } from '@/lib/definitions';

const OnboardingFieldSchema = z.object({
  type: z.enum(['Checkbox', 'RadioBox', 'TextField', 'DropDown', 'Link']),
  name: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
  helpText: z.string().optional(),
  proof: z.boolean().optional(),
  proofLink: z.string().optional(),
});

const OnboardingPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string().email(),
  sendEmailOnComplete: z.boolean(),
  statusOptions: z.array(z.string()),
  fields: z.array(OnboardingFieldSchema),
});

const OnboardingConfigurationSchema = z.object({
  name: z.string(),
  version: z.number().int().positive(),
  phases: z.array(OnboardingPhaseSchema),
});

const collectionName = 'settings_baseline_onboarding';


// GET all versions for the baseline onboarding type
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    
    const configs = await collection.find({}).sort({ version: -1 }).toArray();
    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new version of the baseline onboarding config
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = OnboardingConfigurationSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid configuration data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(collectionName);

        const existing = await collection.findOne({ name: validatedData.data.name, version: validatedData.data.version });
        if (existing) {
            return NextResponse.json({ message: `Version ${validatedData.data.version} of "${validatedData.data.name}" already exists.` }, { status: 409 });
        }
        
        const result = await collection.insertOne(validatedData.data as any);

        return NextResponse.json({ ...validatedData.data, _id: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
