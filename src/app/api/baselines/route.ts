
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import type { Baseline, OnboardingConfiguration } from '@/lib/definitions';
import { logAuditEvent } from '@/lib/audit';

const COLLECTION_NAME = 'baselines';

const BaselineCreateSchema = z.object({
    product: z.object({
        id: z.string(),
        name: z.string(),
    }),
    specifications: z.any(),
    tenants: z.any(),
    versionIncrementType: z.enum(['major', 'minor', 'patch']),
});

// List all baselines
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection(COLLECTION_NAME).find({}).sort({ created_at: -1 }).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new baseline
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        const validatedData = BaselineCreateSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid baseline data. Product information is missing.' }, { status: 400 });
        }
        
        const { product, specifications, tenants, versionIncrementType } = validatedData.data;

        const client = await clientPromise;
        const db = client.db();
        const baselinesCollection = db.collection<Baseline>(COLLECTION_NAME);

        // Find the latest baseline for this product to auto-increment version
        const latestBaselines = await baselinesCollection
            .find({ 'product.id': product.id })
            .sort({ 'product.version': -1 }) // Simple sort might not work for semver, fetching all and sorting in code
            .toArray();

        let newVersion = '1.0.0';
        if (latestBaselines.length > 0) {
            // A more robust semver sort
            latestBaselines.sort((a, b) => {
                const aParts = a.product.version.split('.').map(Number);
                const bParts = b.product.version.split('.').map(Number);
                for(let i = 0; i < 3; i++) {
                    if (aParts[i] > bParts[i]) return -1;
                    if (aParts[i] < bParts[i]) return 1;
                }
                return 0;
            });
            const latestVersion = latestBaselines[0].product.version;
            const versionParts = latestVersion.split('.').map(Number);
            
            switch (versionIncrementType) {
                case 'major':
                    versionParts[0] += 1;
                    versionParts[1] = 0;
                    versionParts[2] = 0;
                    break;
                case 'minor':
                    versionParts[1] += 1;
                    versionParts[2] = 0;
                    break;
                case 'patch':
                    versionParts[2] += 1;
                    break;
            }
            newVersion = versionParts.join('.');
        }

        const newBaselineId = `${product.id}_${newVersion}`;

        // Check if this ID already exists
        const existingBaseline = await baselinesCollection.findOne({ _id: newBaselineId });
        if (existingBaseline) {
            return NextResponse.json({ message: `A baseline with ID ${newBaselineId} already exists.` }, { status: 409 });
        }

        // Fetch the latest baseline onboarding configuration
        const onboardingConfigs = await db.collection('settings_baseline_onboarding').find({}).sort({ version: -1 }).limit(1).toArray();
        if (onboardingConfigs.length === 0) {
            return NextResponse.json({ message: 'Baseline onboarding configuration not found.' }, { status: 500 });
        }
        const validationConfig = onboardingConfigs[0] as OnboardingConfiguration;
        
        // Initialize validation phases for the new baseline
        const validationPhases = validationConfig.phases.map(phase => ({
            ...phase,
            status: 'Not Started',
            fields: phase.fields.map(field => ({
                ...field,
                value: '',
                proof: { link: '' }
            }))
        }));
        
        const newBaseline: Baseline = {
            _id: newBaselineId,
            product: { 
                id: product.id, 
                name: product.name, 
                version: newVersion 
            },
            specifications: specifications,
            tenants: tenants,
            status: 'DRAFT',
            validation_phases: validationPhases,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.username,
            artifacts: [
                { name: `${product.name}-${newVersion}-installer.exe`, url: `/downloads/installer.exe`, size: '150.2 MB' },
                { name: `${product.name}-${newVersion}-docs.pdf`, url: `/downloads/docs.pdf`, size: '12.5 MB' },
                { name: `release-notes-v${newVersion}.txt`, url: `/downloads/release-notes.txt`, size: '5.1 KB' },
            ],
            package_properties: {
                location: `s3://release-artifacts/${product.id}/${newVersion}/`,
                checksum_md5: 'd41d8cd98f00b204e9800998ecf8427e',
                checksum_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            }
        };

        await baselinesCollection.insertOne(newBaseline as any);
        
        await logAuditEvent({
            action: 'CREATE',
            entity: 'baseline',
            entityId: newBaselineId,
            comment: `Baseline for product "${product.name}" v${newVersion} created in DRAFT state.`,
        });

        return NextResponse.json(newBaseline, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
