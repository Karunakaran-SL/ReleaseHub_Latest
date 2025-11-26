
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

async function getGitLabToken(userProvidedToken?: string): Promise<string | null> {
    if (userProvidedToken) {
        // Use the token from the request header if this is a test connection from edit mode
        if (userProvidedToken !== 'use-existing-token') {
            return userProvidedToken;
        }
        // If 'use-existing-token', fall through to fetch from DB
    }
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection('cicd_integrations').findOne({ type: 'gitlab' });
    return config?.accessToken || null;
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const userProvidedToken = req.headers.get('x-access-token') || undefined;
        const token = await getGitLabToken(userProvidedToken);

        if (!token) {
            return NextResponse.json({ message: 'GitLab Access Token not configured or provided.' }, { status: 404 });
        }
        
        const { searchParams } = new URL(req.url);
        const instanceUrl = searchParams.get('instanceUrl') || 'https://gitlab.com';

        const apiUrl = `${instanceUrl}/api/v4/projects?owned=true&simple=true&per_page=10&order_by=last_activity_at`;

        const reposResponse = await fetch(apiUrl, {
            headers: { 'PRIVATE-TOKEN': token }
        });

        if (!reposResponse.ok) {
            const errorData = await reposResponse.json();
            console.error("GitLab API Error:", errorData);
            return NextResponse.json({ message: `GitLab API error: ${errorData.message}` }, { status: reposResponse.status });
        }

        const repos = await reposResponse.json();

        const detailedRepos = await Promise.all(repos.map(async (repo: any) => {
            const [branchesRes, commitsRes] = await Promise.all([
                fetch(`${instanceUrl}/api/v4/projects/${repo.id}/repository/branches`, { headers: { 'PRIVATE-TOKEN': token } }),
                fetch(`${instanceUrl}/api/v4/projects/${repo.id}/repository/commits`, { headers: { 'PRIVATE-TOKEN': token } })
            ]);

            const branches = branchesRes.ok ? await branchesRes.json() : [];
            const commits = commitsRes.ok ? await commitsRes.json() : [];

            return {
                id: repo.id,
                name: repo.name,
                description: repo.description,
                default_branch: repo.default_branch,
                branches: branches.slice(0, 5),
                commits: commits.slice(0, 3),
            };
        }));

        return NextResponse.json(detailedRepos, { status: 200 });

    } catch (error: any) {
        console.error('Error in GitLab details endpoint:', error);
        return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
    }
}
