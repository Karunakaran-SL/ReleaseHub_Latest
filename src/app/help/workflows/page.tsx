
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
                        <CardTitle>Workflows Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Workflows.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Define automated sequences (CI/CD pipelines, approval gates, manual steps) for delivering software across environments.</p>

                        <h4 className="mt-4 font-medium">Key Concepts</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><strong>Steps</strong>: build, test, package, sign, export.</li>
                            <li><strong>Approvals</strong>: manual gates with approvers and comments.</li>
                            <li><strong>Triggers</strong>: scheduled, webhook or manual.</li>
                        </ul>

                        <p className="text-muted-foreground">Create or import workflow templates and attach them to products or baselines.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
