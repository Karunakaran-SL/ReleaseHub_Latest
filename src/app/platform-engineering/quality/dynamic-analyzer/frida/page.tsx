'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FridaSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Frida Integration</h1>
                    <p className="text-muted-foreground">Information on using the Frida dynamic instrumentation toolkit.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Command-Line Tool & Scripting</CardTitle>
                        <CardDescription>
                            Frida is used via its command-line tools and by writing JavaScript or TypeScript scripts.
                            <a href="https://frida.re/docs/home/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use Frida, you install its tools and then attach to a running process to inject your scripts.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example of attaching to a process by name and loading a script: <br/>
                                pip install frida-tools <br/>
                                frida -U -f com.example.app -l your-script.js
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            There are no server configurations to manage in this UI; all work is done on the command line or via its language bindings.
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
