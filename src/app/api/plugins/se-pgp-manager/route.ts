import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const DB_NAME = process.env.MONGODB_DB || 'competency_framework';

async function logAuditEvent(db: any, action: string, entityId: string, performedBy: string, details?: any) {
    await db.collection('se_audit').insertOne({
        action,
        entityId,
        performedBy,
        timestamp: new Date(),
        details,
        module: 'se-pgp-manager'
    });
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module') || 'pbs';

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        if (module === 'init') {
            const hasPbs = await db.collection('se_pbs').countDocuments();
            if (hasPbs === 0) {
                const pbs1 = { id: 'PBS-01', name: 'Software Platform', budget: 1500000, reqs: 'ISO26262 ASIL D' };
                const pbs1a = { id: 'PBS-01-A', parentId: 'PBS-01', name: 'Perception Software', budget: 500000, functions: ['FN-001'] };

                const kd1 = { id: 'KD-01', name: 'Architecture Signoff v2', status: 'In Progress', owner: 'Alice', steps: ['Review safety goals', 'Approve BB allocations'] };
                const act1 = { id: 'ACT-01', kdId: 'KD-01', description: 'Update interface definition for SBB-01-B', assignee: 'Bob', status: 'Pending' };

                await db.collection('se_pbs').insertMany([pbs1, pbs1a]);
                await db.collection('se_key_decisions').insertOne(kd1);
                await db.collection('se_actions').insertOne(act1);
                await logAuditEvent(db, 'SEED_DATA', 'ALL', user.name || user.email);
            }
            return NextResponse.json({ message: 'Seeded' });
        }

        if (module === 'dashboard') {
            const [pbsTotal, budgetTotal, kdStats] = await Promise.all([
                db.collection('se_pbs').countDocuments(),
                db.collection('se_pbs').aggregate([{ $group: { _id: null, total: { $sum: "$budget" } } }]).toArray(),
                db.collection('se_key_decisions').aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray()
            ]);
            // Check if System Composition exists
            const scExistsCount = await db.collection('se_systems').countDocuments().catch(() => 0);
            return NextResponse.json({ data: { pbsTotal, budget: budgetTotal[0]?.total || 0, kdStats, hasSystemComp: scExistsCount > 0 } });
        }

        const colMap: Record<string, string> = {
            'pbs': 'se_pbs',
            'kd': 'se_key_decisions',
            'actions': 'se_actions'
        };

        const colName = colMap[module];
        if (!colName) return NextResponse.json({ error: 'Invalid module' }, { status: 400 });

        let query: any = {};
        const kdId = searchParams.get('kdId');
        if (kdId && module === 'actions') query.kdId = kdId;

        const data = await db.collection(colName).find(query).sort({ _id: -1 }).toArray();

        // Optional Dependency: If looking up PBS and SC is installed, try fetching functions
        if (module === 'pbs') {
            try {
                const fns = await db.collection('se_functions').find().toArray();
                if (fns.length > 0) {
                    data.forEach((p: any) => {
                        if (p.functions) {
                            p.functionDetails = p.functions.map((fid: string) => fns.find(f => f.id === fid)).filter(Boolean);
                        }
                    });
                }
            } catch (e) { /* Ignore if collection missing */ }
        }

        return NextResponse.json({ data });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module') || 'pbs';
        const body = await request.json();

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const colMap: Record<string, string> = {
            'pbs': 'se_pbs',
            'kd': 'se_key_decisions',
            'actions': 'se_actions'
        };

        const colName = colMap[module];
        if (!colName) return NextResponse.json({ error: 'Invalid module' }, { status: 400 });

        const doc = { ...body, _createdAt: new Date(), _createdBy: user.email };
        await db.collection(colName).insertOne(doc);

        await logAuditEvent(db, `CREATE_${module.toUpperCase()}`, doc.id || doc._id.toString(), user.name || user.email);

        return NextResponse.json({ message: 'Created successfully', id: doc.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module');
        const id = searchParams.get('id');
        const action = searchParams.get('action'); // 'plan', 'conduct', 'close', 'updateStatus', 'assign-functions'

        if (!module || !id || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        if (module === 'kd') {
            let status = 'Pending';
            if (action === 'conduct') status = 'In Progress';
            if (action === 'close') status = 'Closed';

            await db.collection('se_key_decisions').updateOne({ id }, { $set: { status, [`${action}At`]: new Date() } });
            await logAuditEvent(db, `KD_${action.toUpperCase()}`, id, user.name || user.email);
            return NextResponse.json({ message: `KD mapped to ${status}` });
        }

        if (module === 'actions' && action === 'updateStatus') {
            const body = await request.json();
            await db.collection('se_actions').updateOne({ id }, { $set: { status: body.status } });
            await logAuditEvent(db, `UPDATE_ACTION_STATUS`, id, user.name || user.email, { to: body.status });
            return NextResponse.json({ message: 'Action updated' });
        }

        if (module === 'pbs' && action === 'assign-functions') {
            const body = await request.json(); // { functions: string[] }
            await db.collection('se_pbs').updateOne({ id }, { $set: { functions: body.functions } });
            await logAuditEvent(db, `ASSIGN_FUNCTIONS`, id, user.name || user.email, { funcs: body.functions });
            return NextResponse.json({ message: 'Functions assigned' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
