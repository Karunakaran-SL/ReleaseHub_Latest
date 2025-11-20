'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EsLintSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">ESLint Integration</h1>
                    <p className="text-muted-foreground">Information on using ESLint for JavaScript and TypeScript.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Project-Level Configuration</CardTitle>
                        <CardDescription>
                            ESLint is configured via a `.eslintrc.js` or `.eslintrc.json` file in your project root.
                             <a href="https://eslint.org/docs/latest/use/configure/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            It is run from the command line, often integrated into your `package.json` scripts.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                &#123; <br/>
                                &nbsp;&nbsp;"scripts": &#123; <br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;"lint": "eslint . --ext .js,.jsx,.ts,.tsx" <br/>
                                &nbsp;&nbsp;&#125; <br/>
                                &#125;
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
