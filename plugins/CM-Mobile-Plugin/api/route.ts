import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const MOBILE_DEFAULT = {
    id: 'global',
    enablePushNotifications: true,
    pushNotifyOnAssessmentDue: true,
    pushNotifyOnCertExpiry: true,
    pushNotifyOnNewOpportunity: true,
    enableOfflineMode: false,
    mobileTheme: 'system',
};

export async function GET(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const client = await clientPromise; const db = client.db();
        let config = await db.collection('cm_mobile_config').findOne({ id: 'global' });
        if (!config) config = MOBILE_DEFAULT;
        return NextResponse.json({ status: 'success', data: config });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        await db.collection('cm_mobile_config').updateOne({ id: 'global' }, { $set: { ...data, updatedAt: new Date() } }, { upsert: true });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
