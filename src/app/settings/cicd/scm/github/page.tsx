
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
import { Loader2, CheckCircle, XCircle, GitBranch, GitCommit, Edit, Eye, Folder, File as FileIcon } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RepoDetails {
    name: string;
    full_name: string;
    description: string;
    private: boolean;
    branches: { name: string }[];
    commits: { sha: string; message: string }[];
    default_branch: string;
}

interface FileContent {
    name: string;
    path: string;
    type: 'file' | 'dir';
}

function FileTree({ files }: { files: FileContent[] }) {
    if (!Array.isArray(files)) return <p className="text-xs text-destructive">Could not load files.</p>;
    return (
        <ul className="space-y-1">
            {files.map(file => (
                <li key={file.path} className="flex items-center gap-2 text-sm">
                    {file.type === 'dir' ? <Folder className="h-4 w-4 text-blue-500" /> : <FileIcon className="h-4 w-4 text-gray-500" />}
                    <span>{file.name}</span>
                </li>
            ))}
        </ul>
    );
}

function RepoDetailView({ repo }: { repo: RepoDetails }) {
    const [selectedBranch, setSelectedBranch] = useState(repo.default_branch);
    const [files, setFiles] = useState<FileContent[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    useEffect(() => {
        if (selectedBranch) {
            setLoadingFiles(true);
            fetch(`/api/scm/github/files?repo=${repo.full_name}&branch=${selectedBranch}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setFiles(data);
                    } else {
                        setFiles([]); // Ensure files is always an array
                        console.error("API did not return an array for files:", data);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch files", err);
                    setFiles([]);
                })
                .finally(() => setLoadingFiles(false));
        }
    }, [repo.name, repo.full_name, selectedBranch]);

    return (
        <AccordionItem value={repo.name} key={repo.name}>
            <AccordionTrigger>{repo.name}</AccordionTrigger>
            <AccordionContent>
                <p className="text-sm text-muted-foreground mb-4">{repo.description || 'No description.'}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><GitBranch/>Branches</h4>
                         <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a branch..." />
                            </SelectTrigger>
                            <SelectContent>
                                {repo.branches.map(branch => <SelectItem key={branch.name} value={branch.name}>{branch.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
                    <div>
                        <h4 className="font-semibold mb-2">Files in <span className="font-mono bg-muted px-1 rounded">{selectedBranch}</span></h4>
                        {loadingFiles ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileTree files={files} />}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}


export default function GitHubScmSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [formState, setFormState] = useState({ type: 'github', pat: '', includePublicRepos: false, showFiles: true, _id: '' });
    const [repoDetails, setRepoDetails] = useState<RepoDetails[] | null>(null);
    const [mode, setMode] = useState<'view' | 'edit'>('loading');
    const router = useRouter();

    const { toast } = useToast();

    const fetchRepoDetails = async (includePublic?: boolean, showFiles?: boolean) => {
        setLoading(true);
        setTestStatus('testing');
        try {
            const visibility = includePublic ? 'all' : 'private';
            const response = await fetch(`/api/scm/github/details?visibility=${visibility}`);
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
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while fetching repository details.' });
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
                    const githubConfig = configs.find((c: any) => c.type === 'github');
                    if (githubConfig?._id) {
                        setFormState({ ...githubConfig, pat: '' });
                        setMode('view');
                        fetchRepoDetails(githubConfig.includePublicRepos, githubConfig.showFiles);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTestConnection = async () => {
        const fetched = await fetchRepoDetails(formState.includePublicRepos, formState.showFiles);
        if (fetched) {
            toast({ title: 'Connection Successful', description: 'Successfully connected and fetched repository details.' });
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
            setMode('view');
            fetchRepoDetails(formState.includePublicRepos, formState.showFiles);
        }
    };
    
    if (loading && mode === 'loading') {
        return (
            <DashboardLayout user={user}>
                <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">GitHub Integration</h1>
                    <p className="text-muted-foreground">Configure your connection to GitHub.</p>
                </div>

                {mode === 'edit' ? (
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
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="includePublicRepos"
                                        checked={formState.includePublicRepos}
                                        onCheckedChange={(checked) => setFormState(prev => ({...prev, includePublicRepos: checked}))}
                                    />
                                    <Label htmlFor="includePublicRepos">Show Public Repositories</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Switch
                                        id="showFiles"
                                        checked={formState.showFiles}
                                        onCheckedChange={(checked) => setFormState(prev => ({...prev, showFiles: checked}))}
                                    />
                                    <Label htmlFor="showFiles">Show Files from Selected Branch</Label>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                               <div className="flex gap-2">
                                   <Button type="button" variant="outline" onClick={() => {
                                       if(formState._id) setMode('view');
                                       else router.push('/settings/cicd');
                                   }}>
                                       Cancel
                                   </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Configuration
                                    </Button>
                               </div>
                            </CardFooter>
                        </Card>
                    </form>
                ) : (
                    <>
                        <Card className="max-w-2xl mb-8">
                            <CardHeader>
                                <CardTitle>Current Configuration</CardTitle>
                                <CardDescription>Connection is configured. You can test or update the credentials.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Personal Access Token</Label>
                                    <Input type="password" value="****************************************" disabled />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="includePublicRepos-view" checked={formState.includePublicRepos} disabled />
                                    <Label htmlFor="includePublicRepos-view">Show Public Repositories</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Switch id="showFiles-view" checked={formState.showFiles} disabled />
                                    <Label htmlFor="showFiles-view">Show Files from Selected Branch</Label>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <div>
                                    <Button type="button" variant="secondary" onClick={() => handleTestConnection()} disabled={testStatus === 'testing' || loading}>
                                        {testStatus === 'testing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Test Connection
                                    </Button>
                                    {testStatus === 'success' && <CheckCircle className="ml-2 h-5 w-5 text-green-500 inline-block" />}
                                    {testStatus === 'failed' && <XCircle className="ml-2 h-5 w-5 text-red-500 inline-block" />}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" asChild><Link href="/settings/cicd">Back</Link></Button>
                                    <Button onClick={() => setMode('edit')}><Edit className="mr-2 h-4 w-4"/> Update</Button>
                                </div>
                            </CardFooter>
                        </Card>
                        {repoDetails && formState.showFiles && (
                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle>Accessible Repositories</CardTitle>
                                    <CardDescription>A list of repositories accessible with the provided token.</CardDescription>
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
                    </>
                )}
            </main>
        </DashboardLayout>
    );
}
