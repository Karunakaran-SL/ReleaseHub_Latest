
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
                        <CardTitle>Quick Start Guide</CardTitle>
                        <CardDescription>
                           This page will contain the Quick Start Guide.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <video controls preload="metadata" className="w-full h-auto" title="Release Hub Quick Start Video">
                            <source src="/Release Hub.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
