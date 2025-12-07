
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HelpPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Platform Engineering Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Platform Engineering.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Tools and templates for building platform foundations — CI/CD patterns, observability and deployment templates.</p>

                        <h4 className="mt-4 font-medium">Key Sections</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><strong>Platform Foundations</strong>: curated components and templates.</li>
                            <li><strong>Platform Builder</strong>: construct opinionated stacks from templates and policies.</li>
                            <li><strong>Simulators / Test Environments</strong>: run platform components in a sandbox.</li>
                        </ul>

                        <p className="text-muted-foreground">Validate templates in simulators and pin template versions to ensure reproducible offline builds.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
