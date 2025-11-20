'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';

export default function AstreeSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Astrée Integration</h1>
                    <p className="text-muted-foreground">Configuration for the Astrée sound static analyzer.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Project-Level Configuration</CardTitle>
                        <CardDescription>
                            Astrée is typically configured on a per-project basis using analysis specification files.
                             <a href="https://www.absint.com/astree/manual.htm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                           Astrée analysis is configured using a DAX file (Analysis Specification). This file specifies the source files, preprocessor options, and analysis directives. It is usually managed within your project's version control system.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                &lt;!-- Example DAX file structure --&gt; <br/>
                                &lt;?xml version="1.0" encoding="UTF-8"?&gt;<br/>
                                &lt;da-report&gt;<br/>
                                  &lt;analysis-id&gt;project-alpha&lt;/analysis-id&gt;<br/>
                                  &lt;options&gt; ... &lt;/options&gt;<br/>
                                  &lt;files&gt; ... &lt;/files&gt;<br/>
                                &lt;/da-report&gt;
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
