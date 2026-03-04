import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
const SEED = [
    { id: 'INT-001', name: 'Workday HRIS', type: 'HRIS', status: 'connected', lastSync: new Date('2026-03-01'), syncFrequency: 'Daily', endpoint: 'https://api.workday.com/v1', description: 'Employee directory and org chart sync.' },
    { id: 'INT-002', name: 'Cornerstone LMS', type: 'LMS', status: 'disconnected', lastSync: null, syncFrequency: 'Weekly', endpoint: 'https://api.cornerstoneondemand.com', description: 'Learning assignment and completion sync.' },
    { id: 'INT-003', name: 'Atlassian Jira', type: 'DevTools', status: 'connected', lastSync: new Date('2026-03-04'), syncFrequency: 'Realtime', endpoint: 'https://your-org.atlassian.net/rest/api', description: 'Skill tag extraction from Jira tickets.' },
];
async function ensureSeed(db: any) {
    const c = await db.collection('cm_integrations').countDocuments(); if (c > 0) return;
    for (const i of SEED) await db.collection('cm_integrations').updateOne({ id: i.id }, { $setOnInsert: i }, { upsert: true });
}
export async function GET(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise; const db = client.db(); await ensureSeed(db);
        const data = await db.collection('cm_integrations').find({}).toArray();
        return NextResponse.json({ status: 'success', data });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        if (data.actionType === 'SYNC') {
            await db.collection('cm_integrations').updateOne({ id: data.id }, { $set: { lastSync: new Date(), status: 'connected' } });
            return NextResponse.json({ status: 'success', message: 'Sync triggered' });
        }
        await db.collection('cm_integrations').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
