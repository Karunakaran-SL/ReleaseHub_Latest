'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CodeQLSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">CodeQL Integration</h1>
                    <p className="text-muted-foreground">Information on using the CodeQL analysis engine.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> GitHub & CLI Integration</CardTitle>
                        <CardDescription>
                            CodeQL is integrated into GitHub as part of GitHub Advanced Security. It can also be run via a CLI.
                            <a href="https://codeql.github.com/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                           For GitHub repositories, CodeQL scanning can be enabled via a GitHub Actions workflow file.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example CI steps using the CodeQL CLI: <br/>
                                codeql database create --language=javascript my-database<br/>
                                codeql database analyze my-database --format=sarif-latest --output=results.sarif javascript-code-scanning.qls
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
