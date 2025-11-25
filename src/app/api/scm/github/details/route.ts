
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const COLLECTION_NAME = 'cicd_integrations';

async function getGitHubToken(): Promise<{token: string | null, includePublic: boolean, showFiles: boolean}> {
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection(COLLECTION_NAME).findOne({ type: 'github' });
    // In a real app, this should be decrypted.
    return { 
        token: config?.pat || null, 
        includePublic: config?.includePublicRepos || false,
        showFiles: config?.showFiles !== false // Default to true
    };
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const visibilityParam = searchParams.get('visibility');


        const { token, includePublic } = await getGitHubToken();
        
        let visibility;
        if (visibilityParam) {
            visibility = visibilityParam === 'all' ? 'all' : 'private';
        } else {
            visibility = includePublic ? 'all' : 'private';
        }
        
        if (!token) {
            return NextResponse.json({ message: 'GitHub Personal Access Token not configured.' }, { status: 404 });
        }
        
        const apiUrl = `https://api.github.com/user/repos?visibility=${visibility}&per_page=10&sort=updated`;

        // Fetch repositories from GitHub API
        const reposResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28',
            }
        });

        if (!reposResponse.ok) {
            const errorData = await reposResponse.json();
            return NextResponse.json({ message: `GitHub API error: ${errorData.message}` }, { status: reposResponse.status });
        }
        
        const repos = await reposResponse.json();
        
        // For each repo, fetch branches and commits
        const detailedRepos = await Promise.all(repos.map(async (repo: any) => {
            const [branchesRes, commitsRes] = await Promise.all([
                fetch(repo.branches_url.replace('{/branch}', '?per_page=5'), { headers: { 'Authorization': `token ${token}` } }),
                fetch(repo.commits_url.replace('{/sha}', '?per_page=3'), { headers: { 'Authorization': `token ${token}` } })
            ]);

            const branches = branchesRes.ok ? await branchesRes.json() : [];
            const commits = commitsRes.ok ? await commitsRes.json() : [];

            return {
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                private: repo.private,
                default_branch: repo.default_branch,
                branches: branches.map((b: any) => ({ name: b.name })),
                commits: commits.map((c: any) => ({ sha: c.sha, message: c.commit.message }))
            };
        }));

        return NextResponse.json(detailedRepos, { status: 200 });

    } catch (error: any) {
        console.error('Error in GitHub details endpoint:', error);
        return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
    }
}
