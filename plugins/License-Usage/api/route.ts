import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { ObjectId } from 'mongodb';

const COLLECTION = 'licenses';
const FEATURE_KEY = 'license_usage_manage';

async function checkAuth(action: 'view' | 'create' | 'edit' | 'delete') {
    const user = await getUser();
    if (!user) return { error: 'Unauthorized', status: 401 };
    if (!hasPermission(user.role, FEATURE_KEY, action)) {
        return { error: 'Forbidden: Insufficient permissions', status: 403 };
    }
    return { user };
}

export async function GET(request: Request) {
    const auth = await checkAuth('view');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const client = await clientPromise;
        const db = client.db();

        if (id) {
            const license = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
            if (!license) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(license);
        }

        const licenses = await db.collection(COLLECTION).find({}).toArray();
        return NextResponse.json(licenses);
    } catch (error) {
        console.error('License GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const auth = await checkAuth('create');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const data = await request.json();
        data.createdAt = new Date();
        data.updatedAt = new Date();

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION).insertOne(data);

        return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('License POST error:', error);
        return NextResponse.json({ error: 'Failed to create license' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const auth = await checkAuth('edit');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const data = await request.json();
        delete data._id; // prevent ID update
        data.updatedAt = new Date();

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: data }
        );

        if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('License PUT error:', error);
        return NextResponse.json({ error: 'Failed to update license' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const auth = await checkAuth('delete');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('License DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete license' }, { status: 500 });
    }
}
