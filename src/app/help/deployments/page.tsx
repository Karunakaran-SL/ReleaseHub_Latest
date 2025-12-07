
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
                        <CardTitle>Deployments Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Deployments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Manage release rollouts, view deployment history, and monitor deployment health across environments (online and offline).</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><code>id</code>, <code>name</code>, <code>product</code>, <code>version</code>, <code>environment</code>, <code>status</code>.</li>
                            <li><code>target components</code>: list of CMDB components targeted by the deployment.</li>
                        </ul>

                        <h4 className="mt-4 font-medium">Common Actions</h4>
                        <p className="text-muted-foreground">Start deployments, monitor logs and status, and rollback when necessary. Offline deployments use Transfer Bundles created by Offline CD.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
