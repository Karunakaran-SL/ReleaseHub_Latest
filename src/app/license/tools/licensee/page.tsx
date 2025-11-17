
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LicenseeSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Licensee Integration</h1>
                    <p className="text-muted-foreground">Information on using the Licensee command-line tool.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> CLI Tool Configuration</CardTitle>
                        <CardDescription>
                            Licensee is a command-line tool and does not require server-side configuration through this UI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use Licensee, install it as a gem and run it within your project's directory, typically as part of a CI/CD pipeline script.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example CI/CD step: <br/>
                                gem install licensee <br/>
                                licensee detect --json . &gt; license_report.json
                            </code>
                        </pre>
                        <p className="text-sm text-muted-foreground">
                            The generated report can then be uploaded or processed by other parts of your compliance workflow.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/license/tools">Back to Integrations</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
