import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'matrix';
    const teamId = searchParams.get('teamId');
    try {
        const client = await clientPromise; const db = client.db();
        // Build matrix from employees + skills
        const employees = await db.collection('cm_employees').find({}).toArray();
        const skills = await db.collection('cm_employee_skills').find({}).toArray();
        const competencies = await db.collection('cm_competencies').find({ status: 'active' }).sort({ name: 1 }).toArray();
        // Group by department if teamId == department
        const filteredEmps = teamId ? employees.filter((e: any) => e.department === teamId) : employees;
        const matrix = filteredEmps.map((emp: any) => {
            const empSkills = skills.filter((s: any) => s.employeeId === emp.id);
            return { ...emp, skills: empSkills };
        });
        const departments = [...new Set(employees.map((e: any) => e.department))];
        return NextResponse.json({ status: 'success', data: { matrix, competencies, departments } });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
export async function POST() { return NextResponse.json({ error: 'Matrix is computed read-only' }, { status: 405 }); }
