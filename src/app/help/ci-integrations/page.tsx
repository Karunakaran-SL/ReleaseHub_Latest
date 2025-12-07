
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
                        <CardTitle>CI Integrations Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for CI Integrations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Configure connections to CI systems (Jenkins, GitLab CI, GitHub Actions) to import build artifacts and trigger workflows.</p>

                        <h4 className="mt-4 font-medium">Typical Fields</h4>
                        <p className="text-muted-foreground">Integration name, type (Jenkins/GitLab/GitHub), URL, credentials (token or service account), and project/repo mapping.</p>

                        <h4 className="mt-4 font-medium">Workflows</h4>
                        <p className="text-muted-foreground">Add credentials, test connections, map CI jobs to Products and enable automatic imports via polling or webhooks.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
