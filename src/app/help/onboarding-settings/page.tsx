
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
                        <CardTitle>Onboarding Settings Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Onboarding Settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Configure organization defaults, team memberships, user roles and onboarding flows.</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <p className="text-muted-foreground"><code>organization name</code>, <code>default roles</code>, <code>team definitions</code>, and <code>user invite policy</code>.</p>

                        <h4 className="mt-4 font-medium">Common Tasks</h4>
                        <p className="text-muted-foreground">Invite users, assign roles and configure default approval chains and reviewers for offline deliveries.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
