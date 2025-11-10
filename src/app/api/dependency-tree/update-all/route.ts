
import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';

export async function POST(req: NextRequest) {
    try {
        const { successfulUpdates, failedUpdates } = await generateAndStoreAllProductTrees();

        if (successfulUpdates === 0 && failedUpdates > 0) {
            return NextResponse.json({ message: 'Failed to generate any dependency trees.' }, { status: 500 });
        }
        
        return NextResponse.json({ 
            message: `Dependency metrics updated. ${successfulUpdates} succeeded, ${failedUpdates} failed.`,
            successfulUpdates,
            failedUpdates,
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating dependency metrics:', error);
        return NextResponse.json({ message: 'An internal server error occurred while updating metrics.' }, { status: 500 });
    }
}
