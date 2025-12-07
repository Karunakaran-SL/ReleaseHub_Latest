
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
                        <CardTitle>Specifications Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Specifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Manage hardware, cloud and platform specifications used by templates, CMDB records, and deployment pipelines.</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><code>name</code>: Human-friendly spec name.</li>
                            <li><code>type</code>: Hardware | Cloud | Hypervisor | Platform.</li>
                            <li><code>cpu</code>, <code>memory</code>, <code>storage</code>: resource sizing attributes.</li>
                            <li><code>network</code>: network profile (VLANs, CIDR, ingress rules).</li>
                            <li><code>tags</code>: environment identifiers (dev, qa, prod, airgapped).</li>
                        </ul>

                        <h4 className="mt-4 font-medium">Common Workflows</h4>
                        <p className="text-muted-foreground">Create specs and attach them to products or deployment templates to ensure consistent resource allocation. Specs also feed CMDB and Offline CD bundles.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
