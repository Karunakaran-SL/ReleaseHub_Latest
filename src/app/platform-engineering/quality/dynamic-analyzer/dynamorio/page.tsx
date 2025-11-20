'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DynamoRIOSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">DynamoRIO Integration</h1>
                    <p className="text-muted-foreground">Information on using the DynamoRIO dynamic binary instrumentation framework.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Framework and Command-Line Tool</CardTitle>
                        <CardDescription>
                            DynamoRIO is a tool platform for building custom dynamic analysis tools.
                            <a href="https://dynamorio.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Official Website
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            You use DynamoRIO's API to write a "client" tool in C/C++, then use the `drrun` command to execute an application under the control of your tool.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example of running an application with a client tool: <br/>
                                bin64/drrun -c /path/to/your/client.so -- /path/to/your/application
                            </code>
                        </pre>
                    </CardContent>
                     <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/platform-engineering/quality/dynamic-analyzer">Back to Integrations</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
