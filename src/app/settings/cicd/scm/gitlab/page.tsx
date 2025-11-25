
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
import { Loader2, CheckCircle, XCircle, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { GitBranch, GitCommit } from 'lucide-react';

interface RepoDetails {
    name: string;
    description: string | null;
    default_branch: string;
    // Simplified structures for now
    branches: { name: string }[];
    commits: { id: string; title: string }[];
}

function RepoDetailView({ repo, token, instanceUrl }: { repo: RepoDetails, token: string, instanceUrl: string }) {
    return (
        <AccordionItem value={repo.name} key={repo.name}>
            <AccordionTrigger>{repo.name}</AccordionTrigger>
            <AccordionContent>
                <p className="text-sm text-muted-foreground mb-4">{repo.description || 'No description.'}</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><GitBranch/>Branches</h4>
                        <ul className="space-y-1 text-sm list-disc pl-5">
                            {repo.branches.map(branch => <li key={branch.name}>{branch.name}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><GitCommit/>Recent Commits</h4>
                        <ul className="space-y-2 text-sm">
                            {repo.commits.map(commit => (
                                <li key={commit.id} className="font-mono text-xs truncate" title={commit.title}>
                                    <span className="text-muted-foreground">{commit.id.substring(0, 8)}</span> - {commit.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function GitLabScmSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [formState, setFormState] = useState({ type: 'gitlab', instanceUrl: 'https://gitlab.com', accessToken: '', _id: '' });
    const [repoDetails, setRepoDetails] = useState<RepoDetails[] | null>(null);
    const [mode, setMode] = useState<'view' | 'edit'>('loading');
    const { toast } = useToast();
    const router = useRouter();

    const fetchRepoDetails = async (config: { instanceUrl: string; accessToken: string; }) => {
        setLoading(true);
        setTestStatus('testing');
        try {
            const url = `/api/scm/gitlab/details?instanceUrl=${encodeURIComponent(config.instanceUrl)}`;
            const response = await fetch(url, {
                headers: { 'x-access-token': config.accessToken }
            });

            if (response.ok) {
                const data = await response.json();
                setRepoDetails(data);
                setTestStatus('success');
                return true;
            } else {
                const errorData = await response.json();
                setRepoDetails(null);
                setTestStatus('failed');
                toast({ variant: 'destructive', title: 'Failed to fetch details', description: errorData.message || 'Could not retrieve repository information.' });
                return false;
            }
        } catch (error) {
            console.error("Error fetching repo details", error);
            setTestStatus('failed');
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        getUser().then(setUser);
        
        async function checkInitialConfig() {
            setLoading(true);
            try {
                const response = await fetch('/api/settings/cicd/scm');
                if (response.ok) {
                    const configs = await response.json();
                    const gitlabConfig = configs.find((c: any) => c.type === 'gitlab');
                    if (gitlabConfig?._id) {
                        setFormState({ ...gitlabConfig, accessToken: '' }); // Don't load the token into state
                        setMode('view');
                        // Cannot auto-fetch details without the token, user must test connection
                    } else {
                        setMode('edit');
                    }
                } else {
                    setMode('edit');
                }
            } catch (error) {
                setMode('edit');
                console.error("Could not check for existing config:", error);
            } finally {
                setLoading(false);
            }
        }
        checkInitialConfig();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({...prev, [e.target.id]: e.target.value}));
    }

    const handleTestConnection = async () => {
        const token = formState.accessToken || (mode === 'view' ? 'use-existing-token' : '');
        if (!token) {
            toast({ variant: 'destructive', title: 'Missing Token', description: 'Please enter an access token to test.' });
            return;
        }
        const fetched = await fetchRepoDetails({ instanceUrl: formState.instanceUrl, accessToken: token });
        if (fetched) {
            toast({ title: 'Connection Successful', description: 'Successfully connected and fetched repository details.' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        toast({ title: "Saving Configuration...", description: "Please wait." });
        
        try {
            const response = await fetch('/api/settings/cicd/scm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });
            if (!response.ok) throw new Error('Failed to save configuration');
            toast({ title: "Success", description: "GitLab configuration saved." });
            setMode('view');
            // We don't re-fetch details here as the token is not stored in state after save
            setRepoDetails(null); 
            setTestStatus('idle');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (loading && mode === 'loading') {
        return <DashboardLayout user={user}><div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div ></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">GitLab Integration</h1>
                    <p className="text-muted-foreground">Configure your connection to GitLab.</p>
                </div>

                {mode === 'edit' ? (
                     <form onSubmit={handleSubmit}>
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle>API Settings</CardTitle>
                                <CardDescription>Enter your GitLab instance URL and a Personal Access Token with `api` scope.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="instanceUrl">GitLab URL</Label>
                                    <Input id="instanceUrl" type="url" placeholder="https://gitlab.com" value={formState.instanceUrl} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accessToken">Personal Access Token</Label>
                                    <Input id="accessToken" type="password" value={formState.accessToken} onChange={handleInputChange} />
                                </div>
                            </CardContent>
                             <CardFooter className="flex justify-between items-center">
                                <div>
                                    <Button type="button" variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
                                        {testStatus === 'testing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Test Connection
                                    </Button>
                                    {testStatus === 'success' && <CheckCircle className="ml-2 h-5 w-5 text-green-500 inline-block" />}
                                    {testStatus === 'failed' && <XCircle className="ml-2 h-5 w-5 text-red-500 inline-block" />}
                                </div>
                               <div className="flex gap-2">
                                   <Button type="button" variant="outline" onClick={() => { if(formState._id) setMode('view'); else router.push('/settings/cicd'); }}>Cancel</Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Configuration
                                    </Button>
                               </div>
                            </CardFooter>
                        </Card>
                    </form>
                ) : (
                     <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Current GitLab Configuration</CardTitle>
                            <CardDescription>Connection is configured. You can update the credentials if needed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label>GitLab URL</Label><Input value={formState.instanceUrl} disabled /></div>
                            <div><Label>Personal Access Token</Label><Input type="password" value="****************************************" disabled /></div>
                        </CardContent>
                         <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" asChild><Link href="/settings/cicd">Back</Link></Button>
                            <Button onClick={() => { setMode('edit'); setTestStatus('idle'); setRepoDetails(null); }}><Edit className="mr-2 h-4 w-4"/> Update</Button>
                        </CardFooter>
                    </Card>
                )}
                
                {repoDetails && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Accessible Repositories</CardTitle>
                            <CardDescription>A list of repositories accessible with the provided token.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {repoDetails.map((repo) => (
                                    <RepoDetailView key={repo.name} repo={repo} token={formState.accessToken} instanceUrl={formState.instanceUrl} />
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
            </main>
        </DashboardLayout>
    );
}

