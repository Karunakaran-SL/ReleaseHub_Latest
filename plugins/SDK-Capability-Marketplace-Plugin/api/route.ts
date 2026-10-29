import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const DB_NAME = process.env.MONGODB_DB || 'platform_engineering';

async function logAuditEvent(db: any, action: string, entityId: string, performedBy: string, details?: any) {
    await db.collection('sdk_audit_logs').insertOne({
        action,
        entityId,
        performedBy,
        timestamp: new Date(),
        details,
        module: 'capability-marketplace'
    });
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module') || 'capabilities';

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        if (module === 'init') {
            const hasCaps = await db.collection('sdk_capabilities').countDocuments();
            if (hasCaps === 0) {
                // Section 5: Seed Capabilities
                const kafka = {
                    id: 'kafka', name: 'Apache Kafka', category: 'messaging', description: 'Distributed event streaming platform', status: 'ACTIVE',
                    supportedLanguages: ['java', 'nodejs', 'python', 'golang'],
                    dependenciesByLanguage: {
                        java: { buildTool: 'maven', dependencies: [{ groupId: 'org.springframework.kafka', artifactId: 'spring-kafka', version: '3.1.0' }] },
                        nodejs: { buildTool: 'npm', dependencies: [{ package: 'kafkajs', version: '2.2.4' }] },
                        python: { buildTool: 'pip', dependencies: [{ package: 'confluent-kafka', version: '2.3.0' }] }
                    },
                    templatesByLanguage: { java: ['templates/java/kafka/KafkaProducer.java.mustache'], nodejs: ['templates/nodejs/kafka/producer.js.mustache'] },
                    infrastructure: { helmChart: 'bitnami/kafka', dockerImage: 'bitnami/kafka:latest' },
                    _createdAt: new Date(), _updatedAt: new Date()
                };

                const pg = {
                    id: 'postgresql', name: 'PostgreSQL Database', category: 'databases', description: 'Relational database', status: 'ACTIVE',
                    supportedLanguages: ['java', 'nodejs', 'python'],
                    dependenciesByLanguage: {
                        nodejs: { buildTool: 'npm', dependencies: [{ package: 'pg', version: '8.11.0' }] }
                    },
                    templatesByLanguage: { nodejs: ['templates/nodejs/pg/db.js.mustache'] },
                    infrastructure: { helmChart: 'bitnami/postgresql', dockerImage: 'bitnami/postgresql:latest' },
                    _createdAt: new Date(), _updatedAt: new Date()
                };

                const pendingCap = {
                    id: 'observability-sdk', name: 'Internal OTel SDK', category: 'observability', description: 'OpenTelemetry instrumentation', status: 'PENDING_APPROVAL',
                    supportedLanguages: ['java', 'golang'],
                    _createdAt: new Date(), _updatedAt: new Date()
                };

                await db.collection('sdk_capabilities').insertMany([kafka, pg, pendingCap]);

                // Section 6: Seed Languages
                const l_java = { id: 'java', name: 'Java', frameworks: ['springboot', 'quarkus'], buildTools: ['maven', 'gradle'] };
                const l_python = { id: 'python', name: 'Python', frameworks: ['fastapi', 'flask'], buildTools: ['pip', 'poetry'] };
                const l_node = { id: 'nodejs', name: 'Node.js', frameworks: ['express', 'nest'], buildTools: ['npm', 'yarn'] };

                await db.collection('sdk_languages').insertMany([l_java, l_python, l_node]);

                // Section 7: Versions
                await db.collection('sdk_capability_versions').insertOne({ id: 'kafka_v1', capabilityId: 'kafka', version: '1.0', releaseNotes: 'Initial version', _createdAt: new Date() });

                await logAuditEvent(db, 'SEED_MARKETPLACE', 'ALL', user.name || user.email);
            }
            return NextResponse.json({ message: 'Seeded' });
        }

        if (module === 'dashboard') {
            const [caps, langs, audits] = await Promise.all([
                db.collection('sdk_capabilities').find().toArray(),
                db.collection('sdk_languages').find().toArray(),
                db.collection('sdk_audit_logs').find({ module: 'capability-marketplace' }).sort({ timestamp: -1 }).limit(10).toArray()
            ]);

            const health = {
                active: caps.filter(c => c.status === 'ACTIVE').length,
                deprecated: caps.filter(c => c.status === 'DEPRECATED').length,
                pending: caps.filter(c => c.status === 'PENDING_APPROVAL').length,
            };

            const langAdoption = {
                java: 65, python: 40, nodejs: 30, golang: 15
            };

            return NextResponse.json({ data: { count: caps.length, health, langAdoption, langs: langs.length, audits } });
        }

        const colMap: Record<string, string> = {
            'capabilities': 'sdk_capabilities',
            'languages': 'sdk_languages',
            'versions': 'sdk_capability_versions',
            'audit': 'sdk_audit_logs'
        };

        const colName = colMap[module];
        if (!colName) return NextResponse.json({ error: 'Invalid module' }, { status: 400 });

        let query: any = {};
        const langFilter = searchParams.get('language'); // Spec Section 12 GET by language
        if (langFilter && module === 'capabilities') {
            query.supportedLanguages = langFilter;
        }

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
        const module = searchParams.get('module') || 'capabilities';
        const body = await request.json();

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const colMap: Record<string, string> = {
            'capabilities': 'sdk_capabilities',
            'languages': 'sdk_languages',
            'versions': 'sdk_capability_versions'
        };

        const colName = colMap[module];
        if (!colName) return NextResponse.json({ error: 'Invalid module' }, { status: 400 });

        const doc = { ...body, _createdAt: new Date(), _updatedAt: new Date(), _createdBy: user.email };

        // Spec Section 13 Governance: new caps start as PENDING_APPROVAL unless explicitly set by admin
        if (module === 'capabilities' && !doc.status) doc.status = 'PENDING_APPROVAL';

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
        const module = searchParams.get('module') || 'capabilities';
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const colName = module === 'capabilities' ? 'sdk_capabilities' : 'sdk_languages';

        const updateData = { ...body, _updatedAt: new Date() };
        delete updateData._id;

        await db.collection(colName).updateOne({ id }, { $set: updateData });
        await logAuditEvent(db, `UPDATE_${module.toUpperCase()}`, id, user.name || user.email, { updates: Object.keys(updateData) });

        return NextResponse.json({ message: 'Updated successfully' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module') || 'capabilities';
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const colName = module === 'capabilities' ? 'sdk_capabilities' : 'sdk_languages';

        await db.collection(colName).deleteOne({ id });
        await logAuditEvent(db, `DELETE_${module.toUpperCase()}`, id, user.name || user.email);

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
