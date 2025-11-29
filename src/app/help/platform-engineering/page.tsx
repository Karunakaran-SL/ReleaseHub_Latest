
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
                        <CardTitle>Platform Engineering Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Platform Engineering.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Placeholder for Platform Engineering help content.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
