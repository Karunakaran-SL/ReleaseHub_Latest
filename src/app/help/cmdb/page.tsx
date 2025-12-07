
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
                        <CardTitle>CMDB Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for CMDB.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Inventory and manage infrastructure and platform components (hosts, hypervisors, networks, clusters).</p>

                        <h4 className="mt-4 font-medium">Key Entities & Fields</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><strong>Component</strong>: <code>id</code>, <code>name</code>, <code>hostname</code>, <code>type</code>, <code>environment</code>, <code>spec</code>, <code>location</code>.</li>
                            <li><strong>Tenant/Application</strong>: logical grouping for ownership and access control.</li>
                        </ul>

                        <p className="text-muted-foreground">Use CMDB entries as the source of truth for deployments and Offline CD exports.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
