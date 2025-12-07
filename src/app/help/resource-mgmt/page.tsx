
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
                        <CardTitle>Resource Management Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Resource Management.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Track real-time capacity, allocations and constraints for hosts, clusters and cloud resources.</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <p className="text-muted-foreground"><code>component</code>, <code>allocated</code>, <code>available</code>, <code>thresholds</code>, <code>alerts</code>.</p>

                        <h4 className="mt-4 font-medium">Typical Actions</h4>
                        <p className="text-muted-foreground">Inspect utilization prior to scheduling a deployment, and reserve capacity for critical baselines or maintenance windows.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
