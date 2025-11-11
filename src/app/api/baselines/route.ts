
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import type { Baseline } from '@/lib/definitions';
import { logAuditEvent } from '@/lib/audit';

const COLLECTION_NAME = 'baselines';

const BaselineCreateSchema = z.any(); // We'll accept the dependency tree structure

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
        
        // Basic validation, can be improved with a full Zod schema for the tree
        if (!body.product || !body.product.id) {
             return NextResponse.json({ message: 'Invalid baseline data. Product information is missing.' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        
        const newBaseline: Omit<Baseline, '_id'> = {
            product: { id: body.product.id, name: body.product.name, version: body.product.version },
            specifications: body.specifications,
            tenants: body.tenants,
            status: 'DRAFT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.username,
            // Dummy data for artifacts and package info
            artifacts: [
                { name: `${body.product.name}-installer.exe`, url: `/downloads/installer.exe`, size: '150.2 MB' },
                { name: `${body.product.name}-docs.pdf`, url: `/downloads/docs.pdf`, size: '12.5 MB' },
                { name: `release-notes.txt`, url: `/downloads/release-notes.txt`, size: '5.1 KB' },
            ],
            package_properties: {
                location: `s3://release-artifacts/${body.product.id}/${body.product.version}/`,
                checksum_md5: 'd41d8cd98f00b204e9800998ecf8427e',
                checksum_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            }
        };

        const result = await db.collection(COLLECTION_NAME).insertOne(newBaseline as any);
        const insertedItem = { ...newBaseline, _id: result.insertedId };

        await logAuditEvent({
            action: 'CREATE',
            entity: 'baseline',
            entityId: result.insertedId.toString(),
            comment: `Baseline for product "${body.product.name}" created in DRAFT state.`,
        });

        return NextResponse.json(insertedItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
