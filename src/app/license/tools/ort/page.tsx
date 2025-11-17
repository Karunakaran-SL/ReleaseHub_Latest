
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

export default function OrtSettingsPage() {
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
            toast({ title: "Success", description: "OSS Review Toolkit configuration saved." });
        }, 1500);
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">OSS Review Toolkit (ORT) Integration</h1>
                    <p className="text-muted-foreground">Configure the location of your ORT configuration files.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Configuration Repository</CardTitle>
                            <CardDescription>
                                ORT is configured via files in a Git repository. Provide the location of your central configuration repository.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="repo-url">Git Repository URL</Label>
                                <Input id="repo-url" type="url" placeholder="https://github.com/your-org/ort-config.git" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="config-path">Path to .ort.yml</Label>
                                <Input id="config-path" type="text" placeholder="/path/to/.ort.yml" defaultValue=".ort.yml" />
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                             <Button type="button" variant="outline" asChild>
                                <Link href="/license/tools">Back to Tools</Link>
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
