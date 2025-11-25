
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, CheckCircle, XCircle, GitBranch, GitCommit } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RepoDetails {
    name: string;
    description: string;
    private: boolean;
    branches: { name: string }[];
    commits: { sha: string; message: string }[];
}

export default function GitHubScmSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [formState, setFormState] = useState({
        type: 'github',
        pat: ''
    });
    const [repoDetails, setRepoDetails] = useState<RepoDetails[] | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const fetchRepoDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/scm/github/details');
            if (response.ok) {
                const data = await response.json();
                setRepoDetails(data);
                return true;
            } else {
                console.error("Failed to fetch repo details");
                const errorData = await response.json();
                setRepoDetails(null);
                toast({ variant: 'destructive', title: 'Failed to fetch details', description: errorData.message || 'Could not retrieve repository information.' });
                return false;
            }
        } catch (error) {
            console.error("Error fetching repo details", error);
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while fetching repository details.' });
            return false;
        } finally {
            setLoading(false);
        }
    };


    const handleTestConnection = async () => {
        setTestStatus('testing');
        setRepoDetails(null);
        
        // First, save the config to make it available to the details endpoint
        const saved = await saveConfiguration();
        if (saved) {
            const fetched = await fetchRepoDetails();
            if (fetched) {
                setTestStatus('success');
                toast({ title: 'Connection Successful', description: 'Successfully connected and fetched repository details.' });
            } else {
                setTestStatus('failed');
            }
        } else {
            setTestStatus('failed');
        }
    };
    
    const saveConfiguration = async () => {
         setLoading(true);
        try {
            const response = await fetch('/api/settings/cicd/scm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save configuration');
            }
            return true;
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error Saving', description: error.message });
            return false;
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: "Saving Configuration...", description: "Please wait." });
        const success = await saveConfiguration();
        if (success) {
            toast({ title: "Success", description: "GitHub configuration saved." });
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">GitHub Integration</h1>
                    <p className="text-muted-foreground">Configure your connection to GitHub.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>API Settings</CardTitle>
                            <CardDescription>
                                Create and enter a Fine-Grained Personal Access Token with read-only access to repository contents and metadata.
                                <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                    Create a new token here.
                                </a>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pat">Fine-Grained Personal Access Token</Label>
                                <Input id="pat" type="password" placeholder="ghp_..." value={formState.pat} onChange={(e) => setFormState({...formState, pat: e.target.value})} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <div>
                                <Button type="button" variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'testing' || loading}>
                                    {testStatus === 'testing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Test Connection
                                </Button>
                                {testStatus === 'success' && <CheckCircle className="ml-2 h-5 w-5 text-green-500 inline-block" />}
                                {testStatus === 'failed' && <XCircle className="ml-2 h-5 w-5 text-red-500 inline-block" />}
                            </div>
                           <div className="flex gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/settings/cicd">Back to Integrations</Link>
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Configuration
                                </Button>
                           </div>
                        </CardFooter>
                    </Card>
                </form>

                {repoDetails && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Repository Details</CardTitle>
                            <CardDescription>A list of repositories accessible with the provided token.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {repoDetails.map((repo, index) => (
                                    <AccordionItem value={`item-${index}`} key={repo.name}>
                                        <AccordionTrigger>{repo.name}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-sm text-muted-foreground mb-4">{repo.description || 'No description.'}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><GitBranch/>Branches</h4>
                                                    <ul className="list-disc pl-5 text-sm">
                                                        {repo.branches.map(branch => <li key={branch.name}>{branch.name}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><GitCommit/>Recent Commits</h4>
                                                    <ul className="space-y-2 text-sm">
                                                        {repo.commits.map(commit => (
                                                            <li key={commit.sha} className="font-mono text-xs truncate" title={commit.message}>
                                                                <span className="text-muted-foreground">{commit.sha.substring(0, 7)}</span> - {commit.message.split('\n')[0]}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
            </main>
        </DashboardLayout>
    );
}
