'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { HelpCircle, Box, GitMerge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SECHelpWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><SECHelpPage /></DashboardLayout>;
}

function SECHelpPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3"><HelpCircle className="h-8 w-8 text-indigo-600" /> System Composition Help</h1>
                    <p className="text-muted-foreground mt-2">Learn how to architect and define your system components and building blocks.</p>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-none">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Box className="h-5 w-5 text-indigo-500" /> Core Concepts</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm">1. Systems & Products</h3>
                                <p className="text-sm text-muted-foreground">A <strong>System</strong> represents the top-level architecture (e.g. "Autonomous Driving Core"). A <strong>Product</strong> is a tangible deliverable or version mapped to a system (e.g. "Perception Module v2").</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">2. Building Blocks (BB & SBB)</h3>
                                <p className="text-sm text-muted-foreground"><strong>BB (Building Block)</strong> represents high-level subsystems. <strong>SBB (Sub-Building Block)</strong> represents granular components that belong to a parent BB. You can assign these blocks to specific functional groups like "Perception" or "Control".</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">3. Technical Functions</h3>
                                <p className="text-sm text-muted-foreground">These are granular software interfaces, methods, or specific technical functions (e.g. <code>DetectPedestrians()</code>). They must be explicitly linked to a BB or SBB for traceability.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GitMerge className="h-5 w-5 text-violet-500" /> Integrations</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                The System Composition Manager can optionally integrate with the <strong>PGP Manager Plugin</strong>. If both are installed, technical functions defined here can be natively linked to Product Breakdown Structures (PBS) inside the PGP Manager, offering full end-to-end traceability from program budgets down to technical implementation details.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
