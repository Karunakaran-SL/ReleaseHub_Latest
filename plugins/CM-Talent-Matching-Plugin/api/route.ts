import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

// Weighted skill matching engine
function computeMatchScore(employeeSkills: any[], roleCompetencies: any[]): { score: number; breakdown: any[] } {
    let totalWeight = 0;
    let achieved = 0;
    const breakdown: any[] = [];
    for (const req of roleCompetencies) {
        const empSkill = employeeSkills.find(s => s.competencyId === req.competencyId);
        const currentLevel = empSkill?.currentLevel || 0;
        const weight = req.weight || 10;
        totalWeight += weight;
        const levelScore = Math.min(currentLevel / req.requiredLevel, 1) * weight;
        achieved += levelScore;
        breakdown.push({ competencyId: req.competencyId, requiredLevel: req.requiredLevel, currentLevel, gap: Math.max(0, req.requiredLevel - currentLevel), match: Math.round((levelScore / weight) * 100), mandatory: req.mandatory });
    }
    return { score: totalWeight > 0 ? Math.round((achieved / totalWeight) * 100) : 0, breakdown };
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    try {
        const client = await clientPromise;
        const db = client.db();
        const [employees, allSkills, roles] = await Promise.all([
            db.collection('cm_employees').find({ status: 'active' }).toArray(),
            db.collection('cm_employee_skills').find({}).toArray(),
            db.collection('cm_roles').find({}).toArray(),
        ]);
        const targetRole = roleId ? roles.find((r: any) => r.id === roleId) : null;
        const matches = employees.map((emp: any) => {
            const empSkills = allSkills.filter((s: any) => s.employeeId === emp.id);
            const roleMatches = roles.map((role: any) => {
                const { score, breakdown } = computeMatchScore(empSkills, role.competencies || []);
                return { roleId: role.id, roleName: role.name, score, breakdown };
            });
            const best = roleMatches.sort((a, b) => b.score - a.score)[0];
            const targetMatch = targetRole ? roleMatches.find(r => r.roleId === targetRole.id) : best;
            return { ...emp, matchScore: targetMatch?.score || 0, breakdown: targetMatch?.breakdown || [], bestRole: best?.roleName };
        }).sort((a, b) => b.matchScore - a.matchScore);
        return NextResponse.json({ status: 'success', data: matches, roles });
    } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST() {
    return NextResponse.json({ error: 'Talent matching is read-only (computed)' }, { status: 405 });
}
