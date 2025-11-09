import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';

const AuditLogSchema = z.object({
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  entity: z.string(),
  entityId: z.string(),
  comment: z.string(),
});

// List all audit logs
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('audits');
    
    const logs = await collection.find({}).sort({ timestamp: -1 }).toArray();
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new audit log
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = AuditLogSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid audit data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('audits');
        
        const newLog = {
            ...validatedData.data,
            user: user.username,
            timestamp: new Date().toISOString(),
        };

        const result = await collection.insertOne(newLog as any);
        const insertedLog = { ...newLog, _id: result.insertedId };

        return NextResponse.json(insertedLog, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
