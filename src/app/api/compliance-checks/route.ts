
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const ComplianceCheckSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});


// List all or search
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const items = await db.collection('compliance_checks').find({}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error