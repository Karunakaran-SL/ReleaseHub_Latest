import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DB = async () => {
    const client = await clientPromise;
    return client.db();
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const strip = (obj: any) => { const { _id, ...rest } = obj; return rest; };

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const id = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');
    const roleId = searchParams.get('roleId');

    try {
        const db = await DB();

        switch (module) {
            // ── 1. Skill Taxonomy ────────────────────────────────────────────
            case 'competencies':
                const competencies = await db.collection('cm_competencies').find({ status: { $ne: 'archived' } }).sort({ name: 1 }).toArray();
                return NextResponse.json({ status: 'success', data: competencies });

            case 'categories':
                const categories = await db.collection('cm_categories').find({}).sort({ name: 1 }).toArray();
                return NextResponse.json({ status: 'success', data: categories });

            // ── 2. Employee Skill Profiles ───────────────────────────────────
            case 'employee-skills':
                const filter: any = {};
                if (employeeId) filter.employeeId = employeeId;
                const empSkills = await db.collection('cm_employee_skills').find(filter).toArray();
                return NextResponse.json({ status: 'success', data: empSkills });

            case 'employees':
                const employees = await db.collection('cm_employees').find({}).sort({ name: 1 }).toArray();
                return NextResponse.json({ status: 'success', data: employees });

            // ── 3. Assessments ───────────────────────────────────────────────
            case 'assessments':
                const assessments = await db.collection('cm_assessments').find({}).sort({ date: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: assessments });

            // ── 4. Skill Gaps ────────────────────────────────────────────────
            case 'skill-gaps':
                const gapFilter: any = {};
                if (employeeId) gapFilter.employeeId = employeeId;
                if (roleId) gapFilter.roleId = roleId;
                const gaps = await db.collection('cm_skill_gaps').find(gapFilter).sort({ calculatedAt: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: gaps });

            // ── 5. Roles & Jobs ──────────────────────────────────────────────
            case 'roles':
                const roles = await db.collection('cm_roles').find({}).sort({ name: 1 }).toArray();
                return NextResponse.json({ status: 'success', data: roles });

            // ── 6. Talent Matching ───────────────────────────────────────────
            case 'talent-matching':
                const tmRoleId = searchParams.get('roleId');
                const allEmployees = await db.collection('cm_employees').find({}).toArray();
                const allSkills = await db.collection('cm_employee_skills').find({}).toArray();
                const matchRole = tmRoleId ? await db.collection('cm_roles').findOne({ id: tmRoleId }) : null;
                return NextResponse.json({ status: 'success', data: { employees: allEmployees, skills: allSkills, role: matchRole } });

            // ── 7. Learning & Development ────────────────────────────────────
            case 'courses':
                const courses = await db.collection('cm_courses').find({}).sort({ title: 1 }).toArray();
                return NextResponse.json({ status: 'success', data: courses });

            case 'development-plans':
                const devFilter: any = {};
                if (employeeId) devFilter.employeeId = employeeId;
                const devPlans = await db.collection('cm_development_plans').find(devFilter).toArray();
                return NextResponse.json({ status: 'success', data: devPlans });

            // ── 8. Analytics ─────────────────────────────────────────────────
            case 'analytics':
                const [empCount, skillCount, certCount, gapCount] = await Promise.all([
                    db.collection('cm_employees').countDocuments(),
                    db.collection('cm_competencies').countDocuments({ status: { $ne: 'archived' } }),
                    db.collection('cm_certifications').countDocuments({ status: 'valid' }),
                    db.collection('cm_skill_gaps').countDocuments()
                ]);
                const topSkills = await db.collection('cm_employee_skills').aggregate([
                    { $group: { _id: '$competencyId', count: { $sum: 1 }, avgLevel: { $avg: '$currentLevel' } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray();
                const deptDist = await db.collection('cm_employees').aggregate([
                    { $group: { _id: '$department', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]).toArray();
                return NextResponse.json({ status: 'success', data: { empCount, skillCount, certCount, gapCount, topSkills, deptDist } });

            // ── 9. Strategic Planning ────────────────────────────────────────
            case 'skill-plans':
                const plans = await db.collection('cm_skill_plans').find({}).sort({ createdAt: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: plans });

            // ── 10. Team Matrix ──────────────────────────────────────────────
            case 'team-matrix':
                const teamId = searchParams.get('teamId');
                const matrixFilter: any = {};
                if (teamId) matrixFilter.teamId = teamId;
                const matrices = await db.collection('cm_team_matrices').find(matrixFilter).toArray();
                return NextResponse.json({ status: 'success', data: matrices });

            // ── 11. Talent Marketplace ───────────────────────────────────────
            case 'opportunities':
                const opps = await db.collection('cm_opportunities').find({}).sort({ createdAt: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: opps });

            // ── 12. Career Paths ─────────────────────────────────────────────
            case 'career-paths':
                const paths = await db.collection('cm_career_paths').find({}).toArray();
                return NextResponse.json({ status: 'success', data: paths });

            // ── 13. Certifications ───────────────────────────────────────────
            case 'certifications':
                const certFilter: any = {};
                if (employeeId) certFilter.employeeId = employeeId;
                const certs = await db.collection('cm_certifications').find(certFilter).sort({ validUntil: 1 }).toArray();
                return NextResponse.json({ status: 'success', data: certs });

            // ── 14. Performance ──────────────────────────────────────────────
            case 'performance':
                const perfFilter: any = {};
                if (employeeId) perfFilter.employeeId = employeeId;
                const perf = await db.collection('cm_performance').find(perfFilter).sort({ year: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: perf });

            // ── 15. Competency Risk ──────────────────────────────────────────
            case 'competency-risks':
                const risks = await db.collection('cm_comp_risks').find({}).sort({ riskScore: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: risks });

            // ── 16. Reports ──────────────────────────────────────────────────
            case 'reports':
                const reports = await db.collection('cm_reports').find({}).sort({ generatedAt: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: reports });

            // ── 18. Governance / Audit Logs ───────────────────────────────────
            case 'audit-logs':
                const logs = await db.collection('cm_audit_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray();
                return NextResponse.json({ status: 'success', data: logs });

            // ── 19. Communities ──────────────────────────────────────────────
            case 'forums':
                const forums = await db.collection('cm_forums').find({}).sort({ createdAt: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: forums });

            case 'mentorship':
                const mentorships = await db.collection('cm_mentorship').find({}).toArray();
                return NextResponse.json({ status: 'success', data: mentorships });

            // ── 20. Integrations ─────────────────────────────────────────────
            case 'integrations':
                const integrations = await db.collection('cm_integrations').find({}).toArray();
                return NextResponse.json({ status: 'success', data: integrations });

            // ── 21. AI Recommendations ───────────────────────────────────────
            case 'ai-recommendations':
                const aiFilter: any = {};
                if (employeeId) aiFilter.employeeId = employeeId;
                const recs = await db.collection('cm_ai_recommendations').find(aiFilter).sort({ generatedAt: -1 }).limit(20).toArray();
                return NextResponse.json({ status: 'success', data: recs });

            // ── Global Settings ──────────────────────────────────────────────
            case 'settings':
                let settings: any = await db.collection('cm_settings').findOne({ id: 'global' });
                if (!settings) settings = {
                    id: 'global',
                    proficiencyScale: [
                        { level: 1, label: 'Beginner' },
                        { level: 2, label: 'Elementary' },
                        { level: 3, label: 'Intermediate' },
                        { level: 4, label: 'Advanced' },
                        { level: 5, label: 'Expert' }
                    ],
                    enableVersioning: true,
                    enable360Feedback: true,
                    enableAIRecommendations: true,
                    defaultReviewCycleMonths: 6,
                    requireManagerValidation: true
                };
                return NextResponse.json({ status: 'success', data: settings });

            default:
                return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
        }
    } catch (e) {
        console.error('CM Plugin Error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');

    try {
        const body = await request.json();
        const db = await DB();

        // Audit all mutations
        await db.collection('cm_audit_logs').insertOne({
            userId: user._id,
            timestamp: new Date(),
            module,
            action: body.actionType || 'UPSERT',
            entity: body.id || 'new',
            performedBy: user.username || user.email
        });

        const upsert = async (collection: string, matchField: string = 'id') => {
            const { _id, ...data } = body;
            if (body.actionType === 'DELETE') {
                // Soft delete
                await db.collection(collection).updateOne({ [matchField]: body[matchField] }, { $set: { status: 'archived', archivedAt: new Date(), archivedBy: user.username || user.email } });
            } else {
                await db.collection(collection).updateOne(
                    { [matchField]: data[matchField] },
                    { $set: { ...data, updatedAt: new Date(), updatedBy: user.username || user.email } },
                    { upsert: true }
                );
            }
            return NextResponse.json({ status: 'success' });
        };

        switch (module) {
            case 'competencies': return await upsert('cm_competencies');
            case 'categories': return await upsert('cm_categories');
            case 'employees': return await upsert('cm_employees');
            case 'employee-skills': return await upsert('cm_employee_skills', 'id');
            case 'assessments': return await upsert('cm_assessments');
            case 'roles': return await upsert('cm_roles');
            case 'courses': return await upsert('cm_courses');
            case 'development-plans': return await upsert('cm_development_plans');
            case 'certifications': return await upsert('cm_certifications');
            case 'skill-gaps':
                // Auto-calculate gap scores
                const gapData = { ...body };
                if (Array.isArray(gapData.gaps)) {
                    gapData.gaps = gapData.gaps.map((g: any) => ({ ...g, gap: Math.max(0, (g.requiredLevel || 0) - (g.currentLevel || 0)) }));
                    gapData.totalGap = gapData.gaps.reduce((s: number, g: any) => s + g.gap, 0);
                }
                const { _id: _sid, ...sd } = gapData;
                await db.collection('cm_skill_gaps').updateOne({ id: sd.id }, { $set: { ...sd, calculatedAt: new Date() } }, { upsert: true });
                return NextResponse.json({ status: 'success' });

            case 'career-paths': return await upsert('cm_career_paths');
            case 'opportunities': return await upsert('cm_opportunities');
            case 'performance': return await upsert('cm_performance');
            case 'competency-risks': return await upsert('cm_comp_risks');
            case 'skill-plans': return await upsert('cm_skill_plans');
            case 'forums': return await upsert('cm_forums');
            case 'mentorship': return await upsert('cm_mentorship');
            case 'integrations': return await upsert('cm_integrations');
            case 'settings':
                const { _id: _s, ...sd2 } = body;
                await db.collection('cm_settings').updateOne({ id: 'global' }, { $set: { ...sd2, updatedAt: new Date() } }, { upsert: true });
                return NextResponse.json({ status: 'success' });

            // AI: generate recommendations on demand
            case 'ai-recommendations':
                const empSkillsForAI = await db.collection('cm_employee_skills').find({ employeeId: body.employeeId }).toArray();
                const allComps = await db.collection('cm_competencies').find({ status: { $ne: 'archived' } }).toArray();
                const empCompIds = empSkillsForAI.map((s: any) => s.competencyId);
                const missing = allComps.filter((c: any) => !empCompIds.includes(String(c.id))).slice(0, 5);
                const recommendation = {
                    id: `AI-REC-${Date.now()}`,
                    employeeId: body.employeeId,
                    recommendedCompetencies: missing.map((c: any) => ({ competencyId: c.id, name: c.name, reason: 'Gap identified via AI analysis' })),
                    generatedAt: new Date(),
                    generatedBy: 'AI Engine v1.0'
                };
                await db.collection('cm_ai_recommendations').insertOne(recommendation);
                return NextResponse.json({ status: 'success', data: recommendation });

            default:
                return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
        }
    } catch (err) {
        console.error('CM Plugin POST Error:', err);
        return NextResponse.json({ error: 'Request failed' }, { status: 400 });
    }
}
