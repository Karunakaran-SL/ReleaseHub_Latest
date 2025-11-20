'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ChapSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">CHAP Integration</h1>
                    <p className="text-muted-foreground">Information on using the Core-Dump Hardware-Assisted Analyzer (CHAP).</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Command-Line Tool</CardTitle>
                        <CardDescription>
                            CHAP is a command-line tool used to analyze core dump files for memory issues.
                             <a href="https://github.com/google/chap" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                GitHub Repository
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use CHAP, you run it from the command line against a generated core file.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example command to analyze a core file: <br/>
                                chap -p /path/to/your/program /path/to/core.dump
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            CHAP provides an interactive shell for you to issue commands and inspect the memory state at the time of the crash.
                        </p>
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
