
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function OperationalCompliancePage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Operational Compliance</CardTitle>
                        <CardDescription>
                            Covers ITIL, SOX, internal governance. Focus on workflows, processes, and audit trails.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This section will contain dashboards for workflow compliance, change management audits, and incident response readiness.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
