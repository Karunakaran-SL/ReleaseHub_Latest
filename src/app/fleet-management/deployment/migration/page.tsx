
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function MigrationWizardPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Migration Wizard</CardTitle>
                        <CardDescription>This wizard is under construction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">The step-by-step process for migrating deployments will be implemented here.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
