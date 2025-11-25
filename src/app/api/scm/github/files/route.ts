
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';

const COLLECTION_NAME = 'cicd_integrations';

async function getGitHubToken(): Promise<string | null> {
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection(COLLECTION_NAME).findOne({ type: 'github' });
    return config?.pat || null;
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const repoName = searchParams.get('repo');
        const branchName = searchParams.get('branch');
        const path = searchParams.get('path') || '';

        if (!repoName || !branchName) {
            return NextResponse.json({ message: 'Repository and branch names are required.' }, { status: 400 });
        }
        
        const owner = "firebase"; // This should be dynamic based on your logic, e.g. from the repo full_name
        
        const token = await getGitHubToken();
        if (!token) {
            return NextResponse.json({ message: 'GitHub Personal Access Token not configured.' }, { status: 404 });
        }

        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${branchName}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ message: `GitHub API error: ${errorData.message}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching GitHub files:', error);
        return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
    }
}
