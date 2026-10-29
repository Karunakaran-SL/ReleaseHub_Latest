import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const DB_NAME = process.env.MONGODB_DB || 'competency_framework';

// Helper to log audit events
async function logAuditEvent(db: any, action: string, entityId: string, performedBy: string, details?: any) {
    await db.collection('se_audit').insertOne({
        action,
        entityId,
        performedBy,
        timestamp: new Date(),
        details,
        module: 'se-system-composition'
    });
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module') || 'systems'; // systems, products, building-blocks, functions, dashboard, init

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        // Seeding logic for SE plugin demonstration
        if (module === 'init') {
            const hasSystems = await db.collection('se_systems').countDocuments();
            if (hasSystems === 0) {
                const sys1 = { id: 'SYS-001', name: 'Autonomous Driving Core', description: 'Central compute system for self-driving stack', _createdAt: new Date() };
                const prod1 = { id: 'PRD-101', systemId: 'SYS-001', name: 'Perception Module v2', version: '2.0.0', _createdAt: new Date() };
                const prod2 = { id: 'PRD-102', systemId: 'SYS-001', name: 'Planning & Control', version: '1.5.0', _createdAt: new Date() };

                const bb1 = { id: 'BB-01', name: 'Sensor Fusion Engine', type: 'BB', functionalGroup: 'Perception', linkedProducts: ['PRD-101'] };
                const sbb1 = { id: 'SBB-01-A', parentId: 'BB-01', name: 'LiDAR Pre-processor', type: 'SBB', functionalGroup: 'Perception' };
                const sbb2 = { id: 'SBB-01-B', parentId: 'BB-01', name: 'Camera Object Detector', type: 'SBB', functionalGroup: 'Perception' };

                const func1 = { id: 'FN-001', name: 'DetectPedestrians()', linkedTo: 'SBB-01-B', type: 'Function' };

                await db.collection('se_systems').insertOne(sys1);
                await db.collection('se_products').insertMany([prod1, prod2]);
                await db.collection('se_building_blocks').insertMany([bb1, sbb1, sbb2]);
                await db.collection('se_functions').insertOne(func1);

                await logAuditEvent(db, 'SEED_DATA', 'ALL', user.name || user.email);
            }
            return NextResponse.json({ message: 'Seeded' });
        }

        if (module === 'dashboard') {
            const [sysCount, prodCount, bbCount, recentAudit, bbGroups] = await Promise.all([
                db.collection('se_systems').countDocuments(),
                db.collection('se_products').countDocuments(),
                db.collection('se_building_blocks').countDocuments(),
                db.collection('se_audit').find({ module: 'se-system-composition' }).sort({ timestamp: -1 }).limit(10).toArray(),
                db.collection('se_building_blocks').aggregate([{ $group: { _id: "$functionalGroup", count: { $sum: 1 } } }]).toArray()
            ]);
            return NextResponse.json({ data: { sysCount, prodCount, bbCount, bbGroups, recentAudit } });
        }

        const colMap: Record<string, string> = {
            'systems': 'se_systems',
            'products': 'se_products',
            'building-blocks': 'se_building_blocks',
            'functions': 'se_functions',
            'audit': 'se_audit'
        };

        const colName = colMap[module];
        if (!colName) return NextResponse.json({ error: 'Invalid module' }, { status: 400 });

        let query: any = {};
        const systemId = searchParams.get('systemId');
        if (systemId && module === 'products') query.systemId = systemId;

        const data = await db.collection(colName).find(query).sort({ _createdAt: -1, timestamp: -1 }).toArray();
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
        const module = searchParams.get('module') || 'systems';
        const body = await request.json();

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const colMap: Record<string, string> = {
            'systems': 'se_systems',
            'products': 'se_products',
            'building-blocks': 'se_building_blocks',
            'functions': 'se_functions'
        };

        const colName = colMap[module];
        if (!colName) return NextResponse.json({ error: 'Invalid module' }, { status: 400 });

        const doc = { ...body, _createdAt: new Date(), _createdBy: user.email };
        await db.collection(colName).insertOne(doc);

        await logAuditEvent(db, `CREATE_${module.toUpperCase()}`, doc.id || doc._id.toString(), user.name || user.email, { name: doc.name });

        return NextResponse.json({ message: 'Created successfully', id: doc.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module');
        const id = searchParams.get('id');

        if (!module || !id) return NextResponse.json({ error: 'Module and ID required' }, { status: 400 });

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const colMap: Record<string, string> = {
            'systems': 'se_systems',
            'products': 'se_products',
            'building-blocks': 'se_building_blocks',
            'functions': 'se_functions'
        };

        const colName = colMap[module];
        if (!colName) return NextResponse.json({ error: 'Invalid module' }, { status: 400 });

        await db.collection(colName).deleteOne({ id: id });
        await logAuditEvent(db, `DELETE_${module.toUpperCase()}`, id, user.name || user.email);

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
