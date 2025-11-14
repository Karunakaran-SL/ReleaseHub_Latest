
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { deploymentId: string } }) {
    try {
        const { deploymentId } = params;

        const client = await clientPromise;
        const db = client.db();
        const history = await db.collection('upgrade_history')
            .find({ deploymentId: deploymentId })
            .sort({ initiatedAt: -1 })
            .toArray();

        if (!history) {
            return NextResponse.json({ message: 'No history found for this deployment.' }, { status: 404 });
        }

        return NextResponse.json(history, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
