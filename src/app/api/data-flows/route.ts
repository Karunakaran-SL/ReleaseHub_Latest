import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const items = await db.collection('dataflows').find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const client = await clientPromise;
        const db = client.db();
        const res = await db.collection('dataflows').insertOne(body);
        return NextResponse.json({ insertedId: res.insertedId }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
