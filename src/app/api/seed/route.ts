
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { seedDatabase } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const { seededCount, skippedCount } = await seedDatabase();

        let message;
        if (seededCount > 0 && skippedCount > 0) {
            message = `Seeded ${seededCount} new collections. ${skippedCount} collections already had data and were skipped.`;
        } else if (seededCount > 0) {
            message = `Successfully seeded ${seededCount} collections.`;
        } else {
            message = `All collections already contain data. No new data was seeded.`;
        }

        return NextResponse.json({ message }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred during seeding.' }, { status: 500 });
    }
}
