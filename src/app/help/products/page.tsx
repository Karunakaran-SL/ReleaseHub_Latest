
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
                        <CardTitle>Products Help</CardTitle>
                        <CardDescription>
                           This page will contain help content for Products.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Track software products, their versions, owners, and artifacts used for releases.</p>

                        <h4 className="mt-4 font-medium">Key Fields</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><code>name</code>, <code>id/slug</code>, <code>team/owner</code>.</li>
                            <li><code>versions</code>: published versions and associated artifacts (images, archives).</li>
                            <li><code>tags</code> and <code>labels</code> for grouping and filtering.</li>
                        </ul>

                        <h4 className="mt-4 font-medium">Typical Actions</h4>
                        <p className="text-muted-foreground">Create products, upload artifacts and promote versions via Release & Baseline. Use APIs like <code>GET /api/products</code> and <code>POST /api/products</code>.</p>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
