'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function KleeSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">KLEE Integration</h1>
                    <p className="text-muted-foreground">Information on using the KLEE Symbolic Execution Engine.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Command-Line Tool</CardTitle>
                        <CardDescription>
                            KLEE operates on LLVM bitcode and is used via the command line.
                            <a href="https://klee.github.io/docs/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            First, you compile your C code to LLVM bitcode, then run KLEE on the bitcode file.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # 1. Compile to LLVM bitcode <br/>
                                clang -emit-llvm -c -g your_program.c <br/><br/>
                                # 2. Run KLEE on the bitcode file <br/>
                                klee your_program.bc
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            KLEE will explore different execution paths and generate test cases for any bugs it finds.
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
