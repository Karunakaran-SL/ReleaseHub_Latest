'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ClangSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Clang Static Analyzer Integration</h1>
                    <p className="text-muted-foreground">Information on using the Clang Static Analyzer.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Build-time Tool</CardTitle>
                        <CardDescription>
                            The Clang Static Analyzer is part of the Clang/LLVM compiler toolchain and is invoked during the build process.
                             <a href="https://clang-analyzer.llvm.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use the analyzer, you typically invoke it via `scan-build` or directly through clang with specific flags.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example usage with scan-build: <br/>
                                scan-build make <br/><br/>
                                # Example direct invocation: <br/>
                                clang --analyze -Xanalyzer -analyzer-output=html -o reports ./**/*.c
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            Integration depends on your specific C/C++/Objective-C build system (e.g., Make, CMake, Xcode).
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
