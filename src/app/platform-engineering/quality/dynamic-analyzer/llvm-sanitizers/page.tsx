'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LlvmSanitizersSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">LLVM/Clang Sanitizers Integration</h1>
                    <p className="text-muted-foreground">Information on using the built-in sanitizers.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Compiler Flag Configuration</CardTitle>
                        <CardDescription>
                            Sanitizers are enabled via compiler flags during the build process. No server configuration is needed.
                             <a href="https://clang.llvm.org/docs/index.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                           To use a sanitizer, add the `-fsanitize` flag to your `clang` or `clang++` compile and link commands.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example for AddressSanitizer (ASan): <br/>
                                clang -fsanitize=address -g your_program.c <br/><br/>
                                # Example for UndefinedBehaviorSanitizer (UBSan): <br/>
                                clang -fsanitize=undefined -g your_program.c
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            When the compiled program is run, the sanitizer will report errors to the console if any are detected.
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
