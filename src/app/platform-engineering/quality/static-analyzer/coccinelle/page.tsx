'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CoccinelleSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Coccinelle Integration</h1>
                    <p className="text-muted-foreground">Information on using the Coccinelle matching and transformation engine.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Command-Line Tool</CardTitle>
                        <CardDescription>
                            Coccinelle is used via the `spatch` command-line tool with semantic patch language (.cocc) files.
                            <a href="https://coccinelle.gitlab.inria.fr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                           Create a semantic patch file (e.g., `my_rule.cocci`) to define the code pattern to find and transform, then run `spatch`.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example command to apply a semantic patch: <br/>
                                spatch -sp_file my_rule.cocci my_source_file.c
                            </code>
                        </pre>
                    </CardContent>
                     <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/platform-engineering/quality/static-analyzer">Back to Integrations</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
