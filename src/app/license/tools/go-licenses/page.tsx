
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GoLicensesSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">go-licenses Integration</h1>
                    <p className="text-muted-foreground">Information on using the go-licenses command-line tool.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> CLI Tool Configuration</CardTitle>
                        <CardDescription>
                            go-licenses is a command-line tool and does not require server-side configuration through this UI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use go-licenses, install it and run it within your Go project's directory, typically as part of a CI/CD pipeline script.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example CI/CD step: <br/>
                                go install github.com/google/go-licenses@latest <br/>
                                go-licenses report ./... --template=./templates/spdx.template &gt; report.spdx
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            The generated report can then be archived or used for compliance checks.
                        </p>
                    </CardContent>
                     <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/license/tools">Back to Tools</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
