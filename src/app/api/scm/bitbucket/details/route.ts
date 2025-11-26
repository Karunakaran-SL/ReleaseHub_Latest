
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

async function getBitbucketCredentials(userProvidedPassword?: string): Promise<{ username: string | null; appPassword: string | null }> {
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection('cicd_integrations').findOne({ type: 'bitbucket' });
    
    // If a password is provided in the header (for testing), use it. Otherwise, use the one from the DB.
    const appPassword = userProvidedPassword && userProvidedPassword !== 'use-existing-password' 
        ? userProvidedPassword 
        : config?.appPassword;

    return { 
        username: config?.username || null,
        appPassword: appPassword || null,
    };
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const userProvidedPassword = req.headers.get('x-app-password') || undefined;
        const { username, appPassword } = await getBitbucketCredentials(userProvidedPassword);

        if (!username || !appPassword) {
            return NextResponse.json({ message: 'Bitbucket credentials not configured or provided.' }, { status: 404 });
        }
        
        const { searchParams } = new URL(req.url);
        const instanceUrl = searchParams.get('instanceUrl') || 'https://api.bitbucket.org/2.0';

        const authString = Buffer.from(`${username}:${appPassword}`).toString('base64');
        const headers = { 'Authorization': `Basic ${authString}` };

        const reposApiUrl = `${instanceUrl}/repositories/${username}?pagelen=10&sort=-updated_on`;
        
        const reposResponse = await fetch(reposApiUrl, { headers });

        if (!reposResponse.ok) {
            const errorData = await reposResponse.json();
            console.error("Bitbucket API Error:", errorData);
            const errorMessage = errorData?.error?.message || 'Failed to fetch repositories.';
            return NextResponse.json({ message: `Bitbucket API error: ${errorMessage}` }, { status: reposResponse.status });
        }

        const reposData = await reposResponse.json();
        const repos = reposData.values;

        const detailedRepos = await Promise.all(repos.map(async (repo: any) => {
            const branchesUrl = `${instanceUrl}/repositories/${repo.full_name}/refs/branches?pagelen=5`;
            const commitsUrl = `${instanceUrl}/repositories/${repo.full_name}/commits?pagelen=3`;
            
            const [branchesRes, commitsRes] = await Promise.all([
                fetch(branchesUrl, { headers }),
                fetch(commitsUrl, { headers })
            ]);

            const branchesData = branchesRes.ok ? await branchesRes.json() : { values: [] };
            const commitsData = commitsRes.ok ? await commitsRes.json() : { values: [] };

            return {
                name: repo.name,
                description: repo.description,
                mainbranch: repo.mainbranch,
                branches: branchesData.values.slice(0,5),
                commits: commitsData.values.slice(0,3).map((c: any) => ({ hash: c.hash, message: c.message })),
            };
        }));
        
        return NextResponse.json(detailedRepos, { status: 200 });

    } catch (error: any) {
        console.error('Error in Bitbucket details endpoint:', error);
        return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
    }
}
