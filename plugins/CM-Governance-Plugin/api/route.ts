import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
export async function GET(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise; const db = client.db();
        const logs = await db.collection('cm_audit_logs').find({}).sort({ timestamp: -1 }).limit(200).toArray();
        return NextResponse.json({ status: 'success', data: logs });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST() { return NextResponse.json({ error: 'Audit logs are immutable' }, { status: 405 }); }
