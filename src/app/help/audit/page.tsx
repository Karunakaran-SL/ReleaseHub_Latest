
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
                        <CardTitle>Audit Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Audit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Store activity logs, change history and events for governance and troubleshooting.</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <p className="text-muted-foreground"><code>timestamp</code>, <code>actor</code>, <code>action</code>, <code>target</code>, <code>details</code>, <code>outcome</code>.</p>

                        <h4 className="mt-4 font-medium">Typical Uses</h4>
                        <p className="text-muted-foreground">Investigate approvals, changes to Offline CD bundles, and events related to deployments and configuration changes.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
