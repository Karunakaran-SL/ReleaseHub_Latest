
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
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function JenkinsSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [instanceUrl, setInstanceUrl] = useState('');
    const [username, setUsername] = useState('');
    const [apiToken, setApiToken] = useState('');

    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const handleTestConnection = async () => {
        setTestStatus('testing');
        // In a real app, this would make an API call to a backend that proxies the test
        setTimeout(() => {
            if (username === 'admin' && apiToken === 'password') {
                setTestStatus('success');
                toast({ title: 'Connection Successful', description: 'Successfully connected to Jenkins.' });
            } else {
                setTestStatus('failed');
                toast({ variant: 'destructive', title: 'Connection Failed', description: 'Could not connect to Jenkins. Check credentials.' });
            }
        }, 1500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        toast({ title: "Saving Configuration...", description: "Please wait." });
        
        try {
            const response = await fetch('/api/settings/cicd/ci', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'jenkins', instanceUrl, username, apiToken }),
            });
            if (!response.ok) throw new Error('Failed to save configuration');
            toast({ title: "Success", description: "Jenkins configuration saved." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Jenkins Integration</h1>
                    <p className="text-muted-foreground">Configure your connection to your Jenkins server.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>API Settings</CardTitle>
                            <CardDescription>
                                Enter your Jenkins URL, username, and an API token.
                                <a href="https://www.jenkins.io/doc/book/using/remote-access-api/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                    Integration Docs
                                </a>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="instance-url">Jenkins URL</Label>
                                <Input id="instance-url" type="url" placeholder="http://jenkins.your-company.com" value={instanceUrl} onChange={(e) => setInstanceUrl(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" type="text" placeholder="Enter your Jenkins username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="api-token">API Token</Label>
                                <Input id="api-token" type="password" placeholder="Enter your API Token" value={apiToken} onChange={(e) => setApiToken(e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <div>
                                <Button type="button" variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
                                    {testStatus === 'testing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Test Connection
                                </Button>
                                {testStatus === 'success' && <CheckCircle className="ml-2 h-5 w-5 text-green-500" />}
                                {testStatus === 'failed' && <XCircle className="ml-2 h-5 w-5 text-red-500" />}
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
            </main>
        </DashboardLayout>
    );
}
