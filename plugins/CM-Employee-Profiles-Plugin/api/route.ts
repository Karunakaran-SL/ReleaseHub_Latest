import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const SEED_EMPLOYEES = [
    { id: 'EMP-001', name: 'Alex Thornton', email: 'alex.thornton@corp.com', department: 'Engineering', roleId: 'ROLE-001', manager: 'David Park', joinDate: '2021-03-15', status: 'active', location: 'London' },
    { id: 'EMP-002', name: 'Priya Sharma', email: 'priya.sharma@corp.com', department: 'Engineering', roleId: 'ROLE-002', manager: 'David Park', joinDate: '2019-07-01', status: 'active', location: 'London' },
    { id: 'EMP-003', name: 'Marcus Chen', email: 'marcus.chen@corp.com', department: 'Engineering', roleId: 'ROLE-003', manager: 'David Park', joinDate: '2022-01-10', status: 'active', location: 'Berlin' },
    { id: 'EMP-004', name: 'Sofia Reyes', email: 'sofia.reyes@corp.com', department: 'Product', roleId: 'ROLE-004', manager: 'James Liu', joinDate: '2020-09-20', status: 'active', location: 'Madrid' },
    { id: 'EMP-005', name: 'James Liu', email: 'james.liu@corp.com', department: 'Product', roleId: 'ROLE-005', manager: 'CEO', joinDate: '2018-04-05', status: 'active', location: 'London' },
    { id: 'EMP-006', name: 'Aisha Kowalski', email: 'aisha.kowalski@corp.com', department: 'Engineering', roleId: 'ROLE-001', manager: 'David Park', joinDate: '2023-02-14', status: 'active', location: 'Warsaw' },
    { id: 'EMP-007', name: 'Tom Eriksson', email: 'tom.eriksson@corp.com', department: 'DevOps', roleId: 'ROLE-006', manager: 'David Park', joinDate: '2021-11-01', status: 'active', location: 'Stockholm' },
    { id: 'EMP-008', name: 'Clara Bieber', email: 'clara.bieber@corp.com', department: 'Design', roleId: 'ROLE-007', manager: 'James Liu', joinDate: '2022-06-15', status: 'active', location: 'Berlin' },
    { id: 'EMP-009', name: 'David Park', email: 'david.park@corp.com', department: 'Engineering', roleId: 'ROLE-008', manager: 'CEO', joinDate: '2017-09-01', status: 'active', location: 'London' },
    { id: 'EMP-010', name: 'Yuki Tanaka', email: 'yuki.tanaka@corp.com', department: 'Data', roleId: 'ROLE-009', manager: 'David Park', joinDate: '2022-03-28', status: 'active', location: 'Tokyo' },
];
const SEED_SKILLS = [
    { id: 'ES-001', employeeId: 'EMP-001', competencyId: 'COMP-001', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-11-01', endorsements: ['EMP-002'] },
    { id: 'ES-002', employeeId: 'EMP-001', competencyId: 'COMP-002', currentLevel: 3, selfAssessedLevel: 3, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-11-01', endorsements: [] },
    { id: 'ES-003', employeeId: 'EMP-001', competencyId: 'COMP-008', currentLevel: 2, selfAssessedLevel: 3, managerValidated: false, validatedBy: null, lastReviewed: '2025-10-15', endorsements: [] },
    { id: 'ES-004', employeeId: 'EMP-002', competencyId: 'COMP-001', currentLevel: 5, selfAssessedLevel: 5, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-12-01', endorsements: ['EMP-001'] },
    { id: 'ES-005', employeeId: 'EMP-002', competencyId: 'COMP-004', currentLevel: 4, selfAssessedLevel: 5, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-12-01', endorsements: [] },
    { id: 'ES-006', employeeId: 'EMP-002', competencyId: 'COMP-005', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-12-01', endorsements: [] },
    { id: 'ES-007', employeeId: 'EMP-003', competencyId: 'COMP-001', currentLevel: 2, selfAssessedLevel: 3, managerValidated: false, validatedBy: null, lastReviewed: '2025-10-01', endorsements: [] },
    { id: 'ES-008', employeeId: 'EMP-003', competencyId: 'COMP-002', currentLevel: 2, selfAssessedLevel: 2, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-10-01', endorsements: [] },
    { id: 'ES-009', employeeId: 'EMP-004', competencyId: 'COMP-015', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-005', lastReviewed: '2025-11-15', endorsements: [] },
    { id: 'ES-010', employeeId: 'EMP-004', competencyId: 'COMP-013', currentLevel: 3, selfAssessedLevel: 3, managerValidated: true, validatedBy: 'EMP-005', lastReviewed: '2025-11-15', endorsements: [] },
    { id: 'ES-011', employeeId: 'EMP-007', competencyId: 'COMP-006', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-09-01', endorsements: [] },
    { id: 'ES-012', employeeId: 'EMP-007', competencyId: 'COMP-007', currentLevel: 4, selfAssessedLevel: 5, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-09-01', endorsements: ['EMP-001'] },
    { id: 'ES-013', employeeId: 'EMP-010', competencyId: 'COMP-009', currentLevel: 3, selfAssessedLevel: 4, managerValidated: false, validatedBy: null, lastReviewed: '2025-08-01', endorsements: [] },
    { id: 'ES-014', employeeId: 'EMP-010', competencyId: 'COMP-010', currentLevel: 2, selfAssessedLevel: 3, managerValidated: false, validatedBy: null, lastReviewed: '2025-08-01', endorsements: [] },
    { id: 'ES-015', employeeId: 'EMP-009', competencyId: 'COMP-012', currentLevel: 5, selfAssessedLevel: 5, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: '2025-10-01', endorsements: ['EMP-001', 'EMP-002'] },
];

async function ensureSeed(db: any) {
    const count = await db.collection('cm_employees').countDocuments();
    if (count > 0) return;
    for (const emp of SEED_EMPLOYEES) {
        await db.collection('cm_employees').updateOne({ id: emp.id }, { $setOnInsert: { ...emp, createdAt: new Date() } }, { upsert: true });
    }
    for (const skill of SEED_SKILLS) {
        await db.collection('cm_employee_skills').updateOne({ id: skill.id }, { $setOnInsert: { ...skill, createdAt: new Date() } }, { upsert: true });
    }
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'employees';
    const employeeId = searchParams.get('employeeId');
    try {
        const client = await clientPromise;
        const db = client.db();
        await ensureSeed(db);
        if (module === 'employees') {
            const data = await db.collection('cm_employees').find({ status: { $ne: 'inactive' } }).sort({ name: 1 }).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        if (module === 'skills') {
            const filter: any = {};
            if (employeeId) filter.employeeId = employeeId;
            const data = await db.collection('cm_employee_skills').find(filter).toArray();
            return NextResponse.json({ status: 'success', data });
        }
        if (module === 'stats') {
            const [empCount, skillAssignments, pendingValidations] = await Promise.all([
                db.collection('cm_employees').countDocuments({ status: 'active' }),
                db.collection('cm_employee_skills').countDocuments(),
                db.collection('cm_employee_skills').countDocuments({ managerValidated: false }),
            ]);
            const avgSkillsPerEmp = empCount > 0 ? Math.round(skillAssignments / empCount) : 0;
            return NextResponse.json({ status: 'success', data: { empCount, skillAssignments, pendingValidations, avgSkillsPerEmp } });
        }
        return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'employees';
    try {
        const body = await request.json();
        const { _id, ...data } = body;
        const client = await clientPromise;
        const db = client.db();
        if (module === 'employees') {
            await db.collection('cm_employees').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date(), updatedBy: user.email }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        } else if (module === 'skills') {
            if (data.actionType === 'ENDORSE') {
                await db.collection('cm_employee_skills').updateOne({ id: data.id }, { $addToSet: { endorsements: user.email } });
            } else if (data.actionType === 'VALIDATE') {
                await db.collection('cm_employee_skills').updateOne({ id: data.id }, { $set: { managerValidated: true, validatedBy: user.email, validatedAt: new Date() } });
            } else {
                await db.collection('cm_employee_skills').updateOne({ id: data.id }, { $set: { ...data, updatedAt: new Date(), updatedBy: user.email }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
            }
        }
        await db.collection('cm_audit_logs').insertOne({ module: 'cm-employee-profiles', action: data.actionType || 'UPSERT', entityId: data.id, performedBy: user.email, timestamp: new Date() });
        return NextResponse.json({ status: 'success' });
    } catch (e) { return NextResponse.json({ error: 'Request failed' }, { status: 400 }); }
}
