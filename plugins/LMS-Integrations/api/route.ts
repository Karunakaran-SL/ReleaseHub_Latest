import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { ObjectId } from 'mongodb';

const COLLECTION = 'lms_tool_configs';
const FEATURE_KEY = 'lms_integration_manage';

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
        const toolId = searchParams.get('toolId');
        const client = await clientPromise;
        const db = client.db();

        if (id) {
            const config = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
            if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(config);
        }

        if (toolId) {
            const config = await db.collection(COLLECTION).findOne({ toolId });
            if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(config);
        }

        const configs = await db.collection(COLLECTION).find({}).toArray();
        return NextResponse.json(configs);
    } catch (error) {
        console.error('LMS Integrations GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 });
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
        console.error('LMS Integrations POST error:', error);
        return NextResponse.json({ error: 'Failed to create configuration' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const auth = await checkAuth('edit');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const toolId = searchParams.get('toolId');

        if (!id && !toolId) return NextResponse.json({ error: 'ID or toolId is required' }, { status: 400 });

        const data = await request.json();
        delete data._id; // prevent ID update
        data.updatedAt = new Date();

        const client = await clientPromise;
        const db = client.db();

        const filter = id ? { _id: new ObjectId(id) } : { toolId };
        const updateOptions = { upsert: !!toolId }; // If updating by toolId, upsert is allowed typically for settings

        const result = await db.collection(COLLECTION).updateOne(
            filter,
            { $set: data },
            updateOptions
        );

        return NextResponse.json({ success: true, upsertedId: result.upsertedId });
    } catch (error) {
        console.error('LMS Integrations PUT error:', error);
        return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
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
        console.error('LMS Integrations DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
    }
}
