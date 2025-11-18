'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SDKPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>SDK Management</CardTitle>
                        <CardDescription>Access and manage Software Development Kits for your platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This page will provide documentation, download links, and configuration details for the available SDKs.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
