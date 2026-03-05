import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_CERTS = [
    { id: 'CERT-001', employeeId: 'EMP-002', employeeName: 'Priya Sharma', name: 'AWS Solutions Architect Professional', issuedBy: 'Amazon Web Services', issuedDate: '2023-06-15', validUntil: '2026-06-15', status: 'valid', linkedCompetencyId: 'COMP-006', verificationUrl: 'https://aws.amazon.com/verify', fileUrl: '' },
    { id: 'CERT-002', employeeId: 'EMP-001', employeeName: 'Alex Thornton', name: 'Certified Kubernetes Administrator (CKA)', issuedBy: 'CNCF', issuedDate: '2024-02-10', validUntil: '2027-02-10', status: 'valid', linkedCompetencyId: 'COMP-007', verificationUrl: 'https://training.linuxfoundation.org', fileUrl: '' },
    { id: 'CERT-003', employeeId: 'EMP-007', employeeName: 'Tom Eriksson', name: 'HashiCorp Terraform Associate', issuedBy: 'HashiCorp', issuedDate: '2023-09-20', validUntil: '2025-09-20', status: 'expiring_soon', linkedCompetencyId: 'COMP-019', verificationUrl: '', fileUrl: '' },
    { id: 'CERT-004', employeeId: 'EMP-010', employeeName: 'Yuki Tanaka', name: 'Google Professional Data Engineer', issuedBy: 'Google Cloud', issuedDate: '2022-11-01', validUntil: '2024-11-01', status: 'expired', linkedCompetencyId: 'COMP-009', verificationUrl: '', fileUrl: '' },
    { id: 'CERT-005', employeeId: 'EMP-009', employeeName: 'David Park', name: 'PMP – Project Management Professional', issuedBy: 'PMI', issuedDate: '2020-05-15', validUntil: '2026-05-15', status: 'valid', linkedCompetencyId: 'COMP-012', verificationUrl: '', fileUrl: '' },
];
async function ensureSeed(db: any) {
    const count = await db.collection('cm_certifications').countDocuments();
    if (count > 0) return;
    for (const c of SEED_CERTS) await db.collection('cm_certifications').updateOne({ id: c.id }, { $setOnInsert: { ...c, createdAt: new Date() } }, { upsert: true });
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    try {
        const client = await clientPromise; const db = client.db();
        await ensureSeed(db);
        const filter: any = {};
        if (employeeId) filter.employeeId = employeeId;
        if (status) filter.status = status;
        const data = await db.collection('cm_certifications').find(filter).sort({ validUntil: 1 }).toArray();
        const now = new Date(); const in90days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        for (const cert of data) {
            if (cert.status === 'valid' && cert.validUntil && new Date(cert.validUntil) <= in90days) cert.status = 'expiring_soon';
        }
        return NextResponse.json({ status: 'success', data });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json(); const { _id, ...data } = body;
        const client = await clientPromise; const db = client.db();
        await db.collection('cm_certifications').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date(), updatedBy: user.email }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        await db.collection('cm_audit_logs').insertOne({ module: 'cm-certifications', action: 'UPSERT', entityId: data.id, performedBy: user.email, timestamp: new Date() });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
