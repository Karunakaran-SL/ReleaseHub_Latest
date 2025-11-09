
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

const collectionName = 'settings_tenant_onboarding';

const initialTenantOnboarding: Omit<OnboardingConfiguration, '_id'> = {
  name: 'Tenant Onboarding',
  version: 1,
  phases: [
    {
      id: "phase-1",
      name: "Initiate Onboarding",
      ownerName: "Sales Team",
      ownerEmail: "sales@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "requestFormSubmitted", label: "Request Form Submitted", proof: true },
        { type: "Checkbox", name: "csApproved", label: "CS Approved", proof: true },
        { type: "Checkbox", name: "pmApproved", label: "PM Approved", proof: true },
        { type: "Checkbox", name: "productTeamAgreement", label: "Product Team Agreement", proof: true },
      ],
    },
    {
      id: "phase-2",
      name: "Product Definitions",
      ownerName: "Product Team",
      ownerEmail: "product@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "architectAgreed", label: "Architect Agreed", proof: true },
        { type: "Checkbox", name: "specChanged", label: "System level Specification changed?", proof: true },
        { type: "Checkbox", name: "hlDesignApproved", label: "High Level Design approved", proof: true },
      ],
    },
    {
        id: "phase-3",
        name: "Detail Design",
        ownerName: "Engineering Team",
        ownerEmail: "eng@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
          { type: "Checkbox", name: "detailDesignDone", label: "Detail design done", proof: true },
          { type: "Checkbox", name: "dependencyIdentified", label: "Dependency identified", proof: true },
          { type: "Checkbox", name: "pertReady", label: "PERT ready", proof: true },
          { type: "Checkbox", name: "testPlanReady", label: "Test Plan ready", proof: true },
        ],
    },
    {
        id: "phase-4",
        name: "Delivery",
        ownerName: "QA Team",
        ownerEmail: "qa@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "implementationDone", label: "Implementation done", proof: true },
            { type: "Checkbox", name: "unitTestDone", label: "Unit test done", proof: true },
            { type: "Checkbox", name: "staticCodeDone", label: "Static Code done", proof: true },
            { type: "Checkbox", name: "systemIntegrationDone", label: "System Integration done", proof: true },
            { type: "Checkbox", name: "systemIntegrationTestingDone", label: "System Integration Testing done", proof: true },
            { type: "Checkbox", name: "allTestCasesAutomated", label: "All Test cases are automated", proof: true },
        ]
    },
     {
        id: "phase-5",
        name: "Alpha Qualification",
        ownerName: "Alpha Team",
        ownerEmail: "alpha@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "uatTestDone", label: "UAT Test done", proof: true },
            { type: "Checkbox", name: "riskReported", label: "Risk reported", proof: true },
            { type: "Checkbox", name: "serviceMetricsDone", label: "Service Metrix are done", proof: true },
        ]
    },
    {
        id: "phase-6",
        name: "Prepare customer",
        ownerName: "Support Team",
        ownerEmail: "support@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "communicatedChanges", label: "Communicated the changes", proof: true },
            { type: "Checkbox", name: "plannedMCWindow", label: "Planned M/C window", proof: true },
        ]
    },
    {
        id: "phase-7",
        name: "Beta Qualification",
        ownerName: "Beta Team",
        ownerEmail: "beta@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "deploymentRunbookForBeta", label: "Deployment Runbook for Beta", proof: true },
            { type: "Checkbox", name: "deploymentDone", label: "Deployment done", proof: true },
            { type: "Checkbox", name: "betaTestsExecuted", label: "Beta Tests are executed and pass", proof: true },
        ]
    },
    {
        id: "phase-8",
        name: "Completed",
        ownerName: "Release Team",
        ownerEmail: "release@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "onboardingCompleteClosure", label: "Onboarding complete closure", proof: true },
        ]
    }
  ],
};


async function seedData() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    
    await collection.deleteMany({ name: initialTenantOnboarding.name });
    await collection.insertOne(initialTenantOnboarding as any);
    console.log(`Seeded ${collectionName} collection.`);

  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
  }
}

// GET all versions for a given onboarding type
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    
    const count = await collection.countDocuments();
    if (count === 0) {
        await seedData();
    }

    const configs = await collection.find({}).sort({ version: -1 }).toArray();
    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new version of an onboarding config
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

        // Ensure this version doesn't already exist
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
