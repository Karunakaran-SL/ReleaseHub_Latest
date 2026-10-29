'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { HelpCircle, Code2, ShieldCheck, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CapHelpWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><CapHelpPage /></DashboardLayout>;
}

function CapHelpPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3"><HelpCircle className="h-8 w-8 text-indigo-600" /> Marketplace Help</h1>
                    <p className="text-muted-foreground mt-2">Publish and manage SDK templates for internal development.</p>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-none border-t-indigo-500 border-t-4">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5" /> Defining Capabilities</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">Capabilities define reusable architecture patterns like Kafka, Redis, or internal observability. When a Platform Engineer publishes a capability, they must define its dependencies per language (e.g. Maven for Java vs npm for Node.js) through the marketplace API. Currently, the UI allows declaring high level capabilities and their base metadata.</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-t-yellow-500 border-t-4">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Governance & Approval</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">Every newly created capability defaults to a status of <strong>PENDING_APPROVAL</strong>.</p>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                <li><strong>Platform Admin</strong>: Can click the badge to toggle its status directly to ACTIVE.</li>
                                <li><strong>Capability Maintainer</strong>: Cannot approve, but can edit definitions.</li>
                                <li><strong>Developer</strong>: Will only see ACTIVE capabilities when they run the internal SDK generator.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-t-emerald-500 border-t-4">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Code2 className="h-5 w-5" /> Supported Languages Matrix</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['Java', 'Kotlin', 'Python', 'Node.js', 'Go', '.NET', 'Rust'].map(l => (
                                    <Badge key={l} variant="outline" className="bg-white">{l}</Badge>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">Manage this Language Registry directly in the Settings menu.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
