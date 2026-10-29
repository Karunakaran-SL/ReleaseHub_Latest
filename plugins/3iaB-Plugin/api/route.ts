import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');

    try {
        const client = await clientPromise;
        const db = client.db();

        switch (module) {
            case 'teams':
                const teams = await db.collection('3iab_teams').find({}).toArray();
                return NextResponse.json({ status: 'success', data: teams });
            case 'schedule':
                const schedule = await db.collection('3iab_schedule').find({}).sort({ week: -1 }).toArray();
                const logs = await db.collection('audit_logs').find({ module: { $in: ['agenda', 'mom'] } }).sort({ timestamp: -1 }).limit(10).toArray();
                return NextResponse.json({ status: 'success', data: schedule, auditLogs: logs });
            case 'actions':
                const actions = await db.collection('3iab_actions').find({}).sort({ dueDate: 1 }).toArray();
                return NextResponse.json({ status: 'success', data: actions });
            case 'risks':
                const risks = await db.collection('3iab_risks').find({}).sort({ score: -1 }).toArray();
                return NextResponse.json({ status: 'success', data: risks });
            case 'health':
                const teamsCount = await db.collection('3iab_teams').countDocuments();
                const upcoming = await db.collection('3iab_schedule').countDocuments({ status: 'Upcoming' });
                const openRisks = await db.collection('3iab_risks').countDocuments({ score: { $gte: 15 }, status: { $ne: 'Mitigated' } });
                const pendingActions = await db.collection('3iab_actions').countDocuments({ status: { $ne: 'Closed' } });
                return NextResponse.json({
                    teams: teamsCount,
                    upcoming: upcoming,
                    risks: openRisks,
                    actions: pendingActions
                });
            case 'settings':
                let config: any = await db.collection('3iab_settings').findOne({ id: 'global' });
                if (!config) config = { id: 'global', roles: ['Product Manager', 'Architect', 'System Engineer', 'QA Engineer', 'UX Designer'] };
                return NextResponse.json({ status: 'success', data: config });
            default:
                return NextResponse.json({ error: 'Unknown module specified' }, { status: 400 });
        }
    } catch (e) {
        console.error("3iaB Plugin API Error:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');

    try {
        const body = await request.json();

        // Audit wrapper logging every mutation automatically
        const auditLog = {
            userId: user._id,
            timestamp: new Date(),
            module,
            action: body.actionType || 'UPDATE',
            data: body
        };

        const client = await clientPromise;
        const db = client.db();
        await db.collection('audit_logs').insertOne(auditLog);

        switch (module) {
            case 'teams':
                if (body.actionType === 'DELETE') {
                    await db.collection('3iab_teams').deleteOne({ id: body.id });
                } else {
                    const { _id, ...teamData } = body; // strip MongoDB _id to avoid $set errors
                    await db.collection('3iab_teams').updateOne({ id: teamData.id }, { $set: teamData }, { upsert: true });
                }
                return NextResponse.json({ status: 'success' });

            case 'schedule':
                await db.collection('3iab_schedule').updateOne({ week: body.week, team: body.team }, { $set: body }, { upsert: true });
                return NextResponse.json({ status: 'success' });

            case 'agenda':
                await db.collection('3iab_schedule').updateOne(
                    { week: body.week, team: body.team },
                    { $push: { agenda: body.item } as any, $set: { status: body.status || "Upcoming" } }, // Ensures status exists
                    { upsert: true }
                );
                return NextResponse.json({ status: 'success' });

            case 'mom':
                await db.collection('3iab_schedule').updateOne(
                    { week: body.week, team: body.team },
                    { $set: { status: 'Closed', notes: body.notes } }
                );
                return NextResponse.json({ status: 'success' });

            case 'actions':
                await db.collection('3iab_actions').updateOne({ id: body.id }, { $set: body }, { upsert: true });
                return NextResponse.json({ status: 'success' });

            case 'risk':
                const payload = { ...body, score: parseInt(body.probability) * parseInt(body.impact) };
                await db.collection('3iab_risks').updateOne({ id: body.id }, { $set: payload }, { upsert: true });
                return NextResponse.json({ status: 'success' });

            case 'settings':
                await db.collection('3iab_settings').updateOne({ id: 'global' }, { $set: body }, { upsert: true });
                return NextResponse.json({ status: 'success' });

            default:
                return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Payload processing failed' }, { status: 400 });
    }
}
