'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StaticAnalyzerPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Quality: Static Analyzer</CardTitle>
                        <CardDescription>Review results from static code analysis tools.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This dashboard will integrate with tools like SonarQube or ESLint to display code quality metrics, code smells, and potential bugs.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
