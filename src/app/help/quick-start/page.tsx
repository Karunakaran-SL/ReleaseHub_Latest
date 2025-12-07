
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
                        <h3 className="text-lg font-semibold">Overview</h3>
                        <p className="text-muted-foreground">Fast orientation to ReleaseHub — onboarding, main navigation, and first tasks.</p>

                        <h4 className="mt-4 font-medium">Getting Started</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li>Log in via the <code>Login</code> page. If you have SSO, follow the org onboarding settings.</li>
                            <li>Open the left-side menu and locate <strong>Products</strong>, <strong>CMDB</strong>, <strong>Deployments</strong> and <strong>Offline CD</strong>.</li>
                        </ul>

                        <h4 className="mt-4 font-medium">First tasks</h4>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            <li><strong>Add a Product:</strong> Products → Create → fill <code>name</code>, <code>team</code>, <code>version</code>, <code>description</code>.</li>
                            <li><strong>Register infrastructure in CMDB:</strong> CMDB → Components → Create with <code>hostname</code>, <code>type</code>, <code>location</code>, <code>environment</code>.</li>
                            <li><strong>Create a Release baseline:</strong> Release & Baseline → New Baseline and add product versions and artifacts.</li>
                        </ul>

                        <h4 className="mt-4 font-medium">Tips</h4>
                        <p className="text-muted-foreground">Use <strong>Offline CD</strong> to build and export artifacts for air-gapped environments and <strong>Workflows</strong> to automate approval gates.</p>
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
