
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

export default function AcrSettingsPage() {
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
            toast({ title: "Success", description: "Azure Container Registry configuration saved." });
        }, 1500);
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Azure Container Registry</h1>
                    <p className="text-muted-foreground">Configure access to your ACR instance.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Service Principal Credentials</CardTitle>
                            <CardDescription>Enter the details of an Azure Service Principal with access to the registry.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="registry-name">Registry Name</Label>
                                <Input id="registry-name" placeholder="myregistry.azurecr.io" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="appId">Service Principal App ID</Label>
                                <Input id="appId" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="password">Service Principal Password</Label>
                                <Input id="password" type="password" />
                            </div>
                              <div className="space-y-2">
                                <Label htmlFor="tenant">Tenant ID</Label>
                                <Input id="tenant" />
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                           <Button type="button" variant="outline" asChild>
                                <Link href="/settings/cicd">Back to Integrations</Link>
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
