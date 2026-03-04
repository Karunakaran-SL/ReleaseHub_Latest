import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(request.url);
        const moduleType = url.searchParams.get('module');

        const client = await clientPromise;
        const db = client.db();

        if (moduleType === 'strategy') {
            const [themeCount, epicCount, activeEpics] = await Promise.all([
                db.collection('agile_themes').countDocuments(),
                db.collection('agile_epics').countDocuments(),
                db.collection('agile_epics').countDocuments({ status: { $in: ['Approved', 'Implementing'] } })
            ]);
            return NextResponse.json({ success: true, data: { themeCount, epicCount, activeEpics, timestamp: new Date().toISOString() } });
        }
        
        if (moduleType === 'execution') {
            const [featureCount, storyCount, inProgressStories] = await Promise.all([
                db.collection('agile_features').countDocuments(),
                db.collection('agile_stories').countDocuments(),
                db.collection('agile_stories').countDocuments({ status: 'In Progress' })
            ]);
            return NextResponse.json({ success: true, data: { featureCount, storyCount, inProgressStories, timestamp: new Date().toISOString() } });
        }

        if (moduleType === 'intelligence') {
            const [riskCount, highRisks] = await Promise.all([
                db.collection('agile_risks').countDocuments(),
                db.collection('agile_risks').countDocuments({ score: { $gte: 20 } })
            ]);
            return NextResponse.json({ success: true, data: { riskCount, highRisks, doraInfo: "DORA data available via /dora endpoint", timestamp: new Date().toISOString() } });
        }

        return NextResponse.json({ success: false, error: 'Module type missing or invalid' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to load data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db();
        
        let collectionName = 'agile_general';
        
        // Router based on type
        if (body.type === 'Theme') {
            collectionName = 'agile_themes';
            if (body.isQuarterLocked) return NextResponse.json({ success: false, error: 'Quarter is locked, modifying Themes is restricted [ST-2]' }, { status: 403 });
        } else if (body.type === 'Epic') {
            collectionName = 'agile_epics';
            if (body.status === 'Approved' && (!body.problemStatement || !body.hypothesis || !body.costOfDelay)) {
                return NextResponse.json({ success: false, error: 'Lean Business Case required before epic approval [SE-1]' }, { status: 400 });
            }
        } else if (body.type === 'Feature') {
            collectionName = 'agile_features';
            if (!body.capabilityId) return NextResponse.json({ success: false, error: 'Capability ID is mandatory for Features [F-1]' }, { status: 400 });
            if (body.status === 'Committed' && !body.benefitHypothesis) return NextResponse.json({ success: false, error: 'Benefit Hypothesis required before feature commit [F-3]' }, { status: 400 });
        } else if (body.type === 'Story') {
            collectionName = 'agile_stories';
            if (!body.featureId) return NextResponse.json({ success: false, error: 'Feature ID is mandatory for Stories [US-1]' }, { status: 400 });
            if (!body.points || !body.acceptanceCriteria) return NextResponse.json({ success: false, error: 'INVEST validation failed. Story points and Acceptance Criteria are required [US-2]' }, { status: 400 });
        } else if (body.type === 'Risk') {
            collectionName = 'agile_risks';
            const score = body.probability * body.impact;
            if (score > 16) console.log(`[Risk Escalation] Risk escalated.`);
            body.score = score;
        }

        const result = await db.collection(collectionName).insertOne({
            ...body,
            createdBy: user.username,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
