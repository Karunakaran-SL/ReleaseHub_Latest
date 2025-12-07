
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
                        <CardTitle>Fleet Management Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Fleet Management.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Oversee and manage deployment targets and runtime resources across fleets of clusters, hypervisors and hosts.</p>

                        <h4 className="mt-4 font-medium">Key Concepts</h4>
                        <p className="text-muted-foreground">Deployment target groups, health, resource usage and drift detection.</p>

                        <h4 className="mt-4 font-medium">Typical Actions</h4>
                        <p className="text-muted-foreground">Group targets into fleets for coordinated operations, monitor fleet health and trigger rolling updates.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
