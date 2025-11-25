
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

        const token = await getGitHubToken();
        if (!token) {
            return NextResponse.json({ message: 'GitHub PAT not configured.' }, { status: 404 });
        }
        
        // This is a placeholder for a real API call. In a production scenario,
        // you would use a library like Octokit to interact with the GitHub API.
        // For this example, we return mock data.
        
        const mockRepos = [
            {
                name: 'release-hub-platfrom',
                description: 'The main platform repository for ReleaseHub.',
                private: true,
                branches: [{ name: 'main' }, { name: 'develop' }, { name: 'feature/new-ui' }],
                commits: [
                    { sha: 'a1b2c3d4', message: 'feat: Add dashboard widgets' },
                    { sha: 'e5f6g7h8', message: 'fix: Correct login redirect' },
                    { sha: 'i9j0k1l2', message: 'docs: Update README' },
                ]
            },
            {
                name: 'microservice-auth',
                description: 'Authentication and Authorization service.',
                private: true,
                branches: [{ name: 'main' }, { name: 'release/v2.1' }],
                commits: [
                    { sha: 'm3n4o5p6', message: 'refactor: Improve token validation' },
                    { sha: 'q7r8s9t0', message: 'chore: Update dependencies' },
                ]
            }
        ];

        return NextResponse.json(mockRepos, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
