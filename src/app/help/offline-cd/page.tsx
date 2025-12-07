
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
                        <CardTitle>Offline CD Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Offline CD.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Build, package and deliver releases to air-gapped/offline environments with approvals and bundled artifacts.</p>

                        <h4 className="mt-4 font-medium">Key Concepts</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><strong>Transfer Bundle</strong>: signed archive containing artifacts, manifests and checksums.</li>
                            <li><strong>Approval Workflow</strong>: staged approvals for bundle creation and deployment.</li>
                            <li><strong>Provenance</strong>: metadata and checksums for offline verification.</li>
                        </ul>

                        <h4 className="mt-4 font-medium">Typical Flow</h4>
                        <ol className="list-decimal pl-5 text-muted-foreground">
                            <li>Author a Release and include product versions/specs.</li>
                            <li>Run Offline CD to assemble a Transfer Bundle.</li>
                            <li>Attach approvals, sign the bundle and export for delivery.</li>
                        </ol>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
