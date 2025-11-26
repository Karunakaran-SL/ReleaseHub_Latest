
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

export default function HarborHelmSettingsPage() {
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
            toast({ title: "Success", description: "Harbor configuration saved." });
        }, 1500);
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Harbor Helm Registry</h1>
                    <p className="text-muted-foreground">Configure your Harbor instance for Helm charts.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Connection Settings</CardTitle>
                            <CardDescription>Enter your Harbor URL and credentials. These are the same credentials used for the container registry.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="url">Harbor URL</Label>
                                <Input id="url" type="url" placeholder="https://harbor.yourcompany.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" />
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
