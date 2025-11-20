'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BanditSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Bandit Integration</h1>
                    <p className="text-muted-foreground">Information on using the Bandit security linter for Python.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> CLI Tool Configuration</CardTitle>
                        <CardDescription>
                            Bandit is a command-line tool and is configured and run within your project's CI/CD pipeline.
                            <a href="https://bandit.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use Bandit, install it via pip and run it against your Python source code.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example CI/CD step: <br/>
                                pip install bandit <br/>
                                bandit -r your_project_directory -f json -o report.json
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            Configuration can be managed via a `.bandit` YAML file in your repository to include/exclude tests and paths.
                        </p>
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
