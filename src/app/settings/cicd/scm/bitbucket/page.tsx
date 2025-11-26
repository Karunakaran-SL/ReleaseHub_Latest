
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
import { Loader2, CheckCircle, XCircle, Edit, GitBranch, GitCommit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface RepoDetails {
    name: string;
    description: string | null;
    mainbranch: { name: string };
    // Simplified structures for now
    branches: { name: string }[];
    commits: { hash: string; message: string }[];
}

function RepoDetailView({ repo }: { repo: RepoDetails }) {
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
                                <li key={commit.hash} className="font-mono text-xs truncate" title={commit.message}>
                                    <span className="text-muted-foreground">{commit.hash.substring(0, 7)}</span> - {commit.message.split('\n')[0]}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function BitbucketSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [formState, setFormState] = useState({ type: 'bitbucket', instanceUrl: '', username: '', appPassword: '', _id: '' });
    const [repoDetails, setRepoDetails] = useState<RepoDetails[] | null>(null);
    const [mode, setMode] = useState<'view' | 'edit'>('loading');
    const { toast } = useToast();
    const router = useRouter();

    const fetchRepoDetails = async (config: { username: string; appPassword: string; instanceUrl?: string }) => {
        setLoading(true);
        setTestStatus('testing');
        try {
            const url = `/api/scm/bitbucket/details?username=${encodeURIComponent(config.username)}&instanceUrl=${encodeURIComponent(config.instanceUrl || 'https://api.bitbucket.org')}`;
            const response = await fetch(url, {
                headers: { 'x-app-password': config.appPassword }
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
                    const bitbucketConfig = configs.find((c: any) => c.type === 'bitbucket');
                    if (bitbucketConfig?._id) {
                        setFormState({ ...bitbucketConfig, appPassword: '' });
                        setMode('view');
                    } else {
                        setMode('edit');
                    }
                } else {
                    setMode('edit');
                }
            } catch (error) {
                setMode('edit');
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
        const password = formState.appPassword || (mode === 'view' ? 'use-existing-password' : '');
        if (!password) {
            toast({ variant: 'destructive', title: 'Missing Password', description: 'Please enter an App Password to test.' });
            return;
        }
        const fetched = await fetchRepoDetails({ ...formState, appPassword: password });
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
            toast({ title: "Success", description: "Bitbucket configuration saved." });
            setMode('view');
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
                    <h1 className="text-3xl font-bold">Bitbucket Integration</h1>
                    <p className="text-muted-foreground">Configure your connection to Bitbucket.</p>
                </div>

                {mode === 'edit' ? (
                     <form onSubmit={handleSubmit}>
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle>API Settings</CardTitle>
                                <CardDescription>Enter your Bitbucket username and an App Password with `repository:read` scope. For self-hosted instances, provide the URL.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="instanceUrl">Bitbucket URL (optional for cloud)</Label>
                                    <Input id="instanceUrl" type="url" placeholder="https://bitbucket.your-company.com" value={formState.instanceUrl} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" value={formState.username} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="appPassword">App Password</Label>
                                    <Input id="appPassword" type="password" value={formState.appPassword} onChange={handleInputChange} />
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
                            <CardTitle>Current Bitbucket Configuration</CardTitle>
                            <CardDescription>Connection is configured. You can update the credentials if needed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label>Bitbucket URL</Label><Input value={formState.instanceUrl || 'https://bitbucket.org'} disabled /></div>
                            <div><Label>Username</Label><Input value={formState.username} disabled /></div>
                            <div><Label>App Password</Label><Input type="password" value="****************" disabled /></div>
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
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {repoDetails.map((repo) => (
                                    <RepoDetailView key={repo.name} repo={repo} />
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
            </main>
        </DashboardLayout>
    );
}

