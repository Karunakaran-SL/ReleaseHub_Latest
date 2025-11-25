
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

export default function BitbucketSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [formState, setFormState] = useState({
        type: 'bitbucket',
        instanceUrl: '',
        username: '',
        appPassword: ''
    });

    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({...prev, [e.target.id]: e.target.value}));
    }

    const handleTestConnection = async () => {
        setTestStatus('testing');
        // This is a placeholder for a real API call to a backend proxy
        setTimeout(() => {
            if (formState.username && formState.appPassword) {
                setTestStatus('success');
                toast({ title: 'Connection Successful', description: 'Successfully connected to Bitbucket.' });
            } else {
                setTestStatus('failed');
                toast({ variant: 'destructive', title: 'Connection Failed', description: 'Please check your credentials.' });
            }
        }, 1500);
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
                    <h1 className="text-3xl font-bold">Bitbucket Integration</h1>
                    <p className="text-muted-foreground">Configure your connection to Bitbucket.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>API Settings</CardTitle>
                            <CardDescription>
                                Enter your Bitbucket username and an App Password with `repository:read` scope. For self-hosted instances, provide the URL.
                            </CardDescription>
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
