
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
                        <CardTitle>Release & Baseline Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Release & Baseline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Create release baselines to group product versions, artifacts and deployment policies for a coordinated release.</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <p className="text-muted-foreground"><code>baseline name</code>, <code>description</code>, <code>included products</code>, <code>approval state</code>.</p>

                        <h4 className="mt-4 font-medium">Typical Actions</h4>
                        <p className="text-muted-foreground">Create a baseline, lock it for approvals and export it as part of an Offline CD Transfer Bundle.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
