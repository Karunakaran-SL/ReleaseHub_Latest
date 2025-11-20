'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QualityIntegrationPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Quality Tool Integrations</CardTitle>
                        <CardDescription>Connect to static and dynamic analysis tools.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This section will allow you to configure integrations with tools like SonarQube, Snyk, and other code quality and security scanners.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
