
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { deploymentId: string } }) {
    try {
        const { deploymentId } = params;
        console.log(`[API /api/upgrade-history/{id}] Fetching history for deploymentId: ${deploymentId}`);

        const client = await clientPromise;
        const db = client.db();
        const history = await db.collection('upgrade_history')
            .find({ deploymentId: deploymentId })
            .sort({ initiatedAt: -1 })
            .toArray();

        if (!history || history.length === 0) {
            console.log(`[API /api/upgrade-history/{id}] No history found for deploymentId: ${deploymentId}`);
            return NextResponse.json([], { status: 200 }); // Return empty array instead of 404
        }
        
        console.log(`[API /api/upgrade-history/{id}] Found ${history.length} history records for deploymentId: ${deploymentId}`);
        return NextResponse.json(history, { status: 200 });
    } catch (error) {
        console.error(`[API /api/upgrade-history/{id}] Error fetching history:`, error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
