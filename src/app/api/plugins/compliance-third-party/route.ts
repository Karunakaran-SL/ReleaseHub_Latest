import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const [vendorCount, approvedVendors, assessmentCount, pendingAssessments] = await Promise.all([
            db.collection('third_party_vendors').countDocuments(),
            db.collection('third_party_vendors').countDocuments({ status: 'approved' }),
            db.collection('vendor_risk_assessments').countDocuments(),
            db.collection('vendor_risk_assessments').countDocuments({ status: 'pending' }),
        ]);

        return NextResponse.json({
            success: true,
            data: { vendorCount, approvedVendors, assessmentCount, pendingAssessments, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Third-party compliance API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load third-party compliance data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = body.type === 'assessment'
            ? db.collection('vendor_risk_assessments')
            : db.collection('third_party_vendors');

        const result = await collection.insertOne({
            ...body,
            createdBy: user.username,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
