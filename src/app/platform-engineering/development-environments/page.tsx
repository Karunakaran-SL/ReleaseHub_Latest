'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevelopmentEnvironmentsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Development Environments</CardTitle>
                        <CardDescription>Manage and provision development environments for your teams.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This interface will allow for the creation, management, and monitoring of containerized or virtualized development environments.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
