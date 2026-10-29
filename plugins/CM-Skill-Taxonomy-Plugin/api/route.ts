import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const DEFAULT_CATEGORIES = [
    { id: 'CAT-01', name: 'Engineering', color: '#6366f1' },
    { id: 'CAT-02', name: 'Architecture', color: '#8b5cf6' },
    { id: 'CAT-03', name: 'Cloud & DevOps', color: '#06b6d4' },
    { id: 'CAT-04', name: 'Data & Analytics', color: '#f59e0b' },
    { id: 'CAT-05', name: 'Security', color: '#ef4444' },
    { id: 'CAT-06', name: 'Leadership', color: '#10b981' },
    { id: 'CAT-07', name: 'Product Management', color: '#f97316' },
    { id: 'CAT-08', name: 'UX & Design', color: '#ec4899' },
    { id: 'CAT-09', name: 'Agile & Process', color: '#14b8a6' },
    { id: 'CAT-10', name: 'Communication', color: '#64748b' },
];

const DEFAULT_LEVELS = [
    { level: 1, label: 'Beginner' },
    { level: 2, label: 'Elementary' },
    { level: 3, label: 'Intermediate' },
    { level: 4, label: 'Advanced' },
    { level: 5, label: 'Expert' }
];

const DEFAULT_COMPETENCIES = [
    { id: 'COMP-001', name: 'Python Programming', categoryId: 'CAT-01', description: 'Writing production-quality Python code.', sfia: 'PROG', esco: 'Python', tags: ['backend', 'scripting'], version: 1, status: 'active' },
    { id: 'COMP-002', name: 'TypeScript / JavaScript', categoryId: 'CAT-01', description: 'Frontend and fullstack development with TS/JS ecosystems.', sfia: 'PROG', esco: 'JavaScript', tags: ['frontend', 'fullstack'], version: 1, status: 'active' },
    { id: 'COMP-003', name: 'Java / Spring Boot', categoryId: 'CAT-01', description: 'Enterprise Java application development.', sfia: 'PROG', esco: 'Java', tags: ['backend', 'enterprise'], version: 1, status: 'active' },
    { id: 'COMP-004', name: 'System Architecture', categoryId: 'CAT-02', description: 'Designing scalable distributed systems.', sfia: 'ARCH', esco: 'Software architecture', tags: ['design', 'scalability'], version: 1, status: 'active' },
    { id: 'COMP-005', name: 'Microservices Design', categoryId: 'CAT-02', description: 'Decomposing systems into microservices.', sfia: 'ARCH', esco: 'Microservices', tags: ['architecture', 'cloud'], version: 1, status: 'active' },
    { id: 'COMP-006', name: 'AWS Cloud Services', categoryId: 'CAT-03', description: 'Using AWS platform services effectively.', sfia: 'CLDP', esco: 'Cloud computing', tags: ['aws', 'cloud'], version: 1, status: 'active' },
    { id: 'COMP-007', name: 'Kubernetes & Docker', categoryId: 'CAT-03', description: 'Container orchestration and management.', sfia: 'CLDP', esco: 'Containerization', tags: ['containers', 'devops'], version: 1, status: 'active' },
    { id: 'COMP-008', name: 'CI/CD Pipelines', categoryId: 'CAT-03', description: 'Building and maintaining delivery pipelines.', sfia: 'CDSP', esco: 'DevOps', tags: ['devops', 'automation'], version: 1, status: 'active' },
    { id: 'COMP-009', name: 'Data Engineering', categoryId: 'CAT-04', description: 'Building data pipelines and warehouses.', sfia: 'DATA', esco: 'Data pipelines', tags: ['data', 'etl'], version: 1, status: 'active' },
    { id: 'COMP-010', name: 'Machine Learning', categoryId: 'CAT-04', description: 'Developing and deploying ML models.', sfia: 'MLNG', esco: 'Machine learning', tags: ['ai', 'data'], version: 1, status: 'active' },
    { id: 'COMP-011', name: 'Application Security', categoryId: 'CAT-05', description: 'Implementing secure coding practices.', sfia: 'SCTY', esco: 'Cybersecurity', tags: ['security', 'devsecops'], version: 1, status: 'active' },
    { id: 'COMP-012', name: 'Team Leadership', categoryId: 'CAT-06', description: 'Leading and coaching engineering teams.', sfia: 'MANA', esco: 'Team management', tags: ['leadership', 'people'], version: 1, status: 'active' },
    { id: 'COMP-013', name: 'Agile / Scrum', categoryId: 'CAT-09', description: 'Agile methodologies and scrum ceremonies.', sfia: 'METL', esco: 'Agile methodology', tags: ['agile', 'scrum'], version: 1, status: 'active' },
    { id: 'COMP-014', name: 'Technical Communication', categoryId: 'CAT-10', description: 'Writing clear documentation and presenting.', sfia: 'CMSK', esco: 'Technical writing', tags: ['communication', 'docs'], version: 1, status: 'active' },
    { id: 'COMP-015', name: 'Product Roadmapping', categoryId: 'CAT-07', description: 'Defining and managing product strategy.', sfia: 'PROD', esco: 'Product management', tags: ['product', 'strategy'], version: 1, status: 'active' },
    { id: 'COMP-016', name: 'React / Next.js', categoryId: 'CAT-01', description: 'Modern React development with Next.js.', sfia: 'PROG', esco: 'React', tags: ['frontend', 'react'], version: 1, status: 'active' },
    { id: 'COMP-017', name: 'MongoDB / NoSQL', categoryId: 'CAT-04', description: 'Document database design and optimization.', sfia: 'DBAM', esco: 'NoSQL databases', tags: ['database', 'nosql'], version: 1, status: 'active' },
    { id: 'COMP-018', name: 'UX Research', categoryId: 'CAT-08', description: 'User research and design thinking.', sfia: 'HCEV', esco: 'UX design', tags: ['ux', 'design'], version: 1, status: 'active' },
    { id: 'COMP-019', name: 'Infrastructure as Code', categoryId: 'CAT-03', description: 'Terraform, CloudFormation, Pulumi.', sfia: 'CLDP', esco: 'IaC', tags: ['iac', 'devops'], version: 1, status: 'active' },
    { id: 'COMP-020', name: 'Stakeholder Management', categoryId: 'CAT-06', description: 'Managing stakeholder expectations.', sfia: 'RLMT', esco: 'Stakeholder engagement', tags: ['leadership', 'communication'], version: 1, status: 'active' },
];

async function ensureSeedData(db: any) {
    const count = await db.collection('cm_competencies').countDocuments();
    if (count > 0) return;
    for (const cat of DEFAULT_CATEGORIES) {
        await db.collection('cm_categories').updateOne({ id: cat.id }, { $setOnInsert: { ...cat, createdAt: new Date() } }, { upsert: true });
    }
    for (const comp of DEFAULT_COMPETENCIES) {
        await db.collection('cm_competencies').updateOne({ id: comp.id }, { $setOnInsert: { ...comp, levels: DEFAULT_LEVELS, createdAt: new Date() } }, { upsert: true });
    }
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'competencies';
    try {
        const client = await clientPromise;
        const db = client.db();
        await ensureSeedData(db);

        if (module === 'competencies') {
            const status = searchParams.get('status');
            const categoryId = searchParams.get('categoryId');
            const filter: any = {};
            if (status) filter.status = status; else filter.status = { $ne: 'archived' };
            if (categoryId) filter.categoryId = categoryId;
            const data = await db.collection('cm_competencies').find(filter).sort({ name: 1 }).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        if (module === 'categories') {
            const data = await db.collection('cm_categories').find({}).sort({ name: 1 }).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        if (module === 'stats') {
            const [total, active, archived, cats] = await Promise.all([
                db.collection('cm_competencies').countDocuments(),
                db.collection('cm_competencies').countDocuments({ status: 'active' }),
                db.collection('cm_competencies').countDocuments({ status: 'archived' }),
                db.collection('cm_categories').countDocuments(),
            ]);
            const byCategory = await db.collection('cm_competencies').aggregate([
                { $match: { status: { $ne: 'archived' } } },
                { $group: { _id: '$categoryId', count: { $sum: 1 } } }
            ]).toArray();
            return NextResponse.json({ status: 'success', data: { total, active, archived, cats, byCategory } });
        }
        return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'competencies';
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const { _id, ...data } = body;

        if (module === 'competencies') {
            if (data.actionType === 'DELETE') {
                await db.collection('cm_competencies').updateOne({ id: data.id }, { $set: { status: 'archived', archivedAt: new Date(), archivedBy: user.email } });
            } else {
                await db.collection('cm_competencies').updateOne(
                    { id: data.id },
                    { $set: { ...data, updatedAt: new Date(), updatedBy: user.email }, $setOnInsert: { createdAt: new Date() } },
                    { upsert: true }
                );
            }
            await db.collection('cm_audit_logs').insertOne({ module: 'cm-skill-taxonomy', action: data.actionType || 'UPSERT', entityId: data.id, entityType: 'competency', performedBy: user.email, timestamp: new Date() });
            return NextResponse.json({ status: 'success' });
        }
        if (module === 'categories') {
            await db.collection('cm_categories').updateOne(
                { id: data.id },
                { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
                { upsert: true }
            );
            return NextResponse.json({ status: 'success' });
        }
        return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'Request failed' }, { status: 400 });
    }
}
