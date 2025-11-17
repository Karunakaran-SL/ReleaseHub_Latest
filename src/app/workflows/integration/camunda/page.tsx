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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CamundaSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        toast({ title: "Saving Configuration...", description: "Please wait." });
        setTimeout(() => {
            setLoading(false);
            toast({ title: "Success", description: "Camunda configuration saved." });
        }, 1500);
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Camunda Platform Integration</h1>
                    <p className="text-muted-foreground">Configure your connection to Camunda Platform.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>API Settings</CardTitle>
                            <CardDescription>
                                Enter your Camunda API endpoint and credentials.
                                <a href="https://docs.camunda.io/docs/apis-clients/getting-started-apis-clients/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                    Integration Docs
                                </a>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="api-url">REST API URL</Label>
                                <Input id="api-url" type="url" placeholder="https://your-zeebe-gateway" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client-id">Client ID</Label>
                                <Input id="client-id" type="text" placeholder="Enter your Client ID" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="client-secret">Client Secret</Label>
                                <Input id="client-secret" type="password" placeholder="Enter your Client Secret" />
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                           <Button type="button" variant="outline" asChild>
                                <Link href="/workflows/integration">Back to Integrations</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Configuration
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}