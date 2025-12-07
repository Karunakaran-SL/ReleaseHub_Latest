
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
                        <CardTitle>License Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for License management.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Track product licenses and entitlements used by deployed software and tools.</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <p className="text-muted-foreground"><code>product</code>, <code>license key</code>, <code>expiry</code>, <code>assigned hosts</code>, <code>compliance status</code>.</p>

                        <h4 className="mt-4 font-medium">Typical Actions</h4>
                        <p className="text-muted-foreground">Register licenses, assign them to products or hosts, and run compliance scans to detect expired or missing licenses.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
