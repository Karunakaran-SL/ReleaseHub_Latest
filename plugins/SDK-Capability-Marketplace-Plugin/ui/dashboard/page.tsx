'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, CheckCircle, AlertTriangle, Code2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const API = '/api/plugins/sdk-capability-marketplace?module=dashboard';

export default function CapDashboardWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><CapDashboardPage /></DashboardLayout>;
}

function CapDashboardPage() {
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        fetch(API).then(r => r.json()).then(r => { if (r.data) setStats(r.data); });
    }, []);

    const health = stats.health || { active: 0, pending: 0, deprecated: 0 };
    const lang = stats.langAdoption || { java: 0, python: 0, nodejs: 0, golang: 0 };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Marketplace Overview</h1>
                <p className="text-muted-foreground">Usage tracking, top capabilities, and marketplace health compliance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="shadow-none border-t-indigo-500 border-t-4">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Total Capabilities</CardDescription>
                        <CardTitle className="text-4xl">{stats.count || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link href="/plugins/sdk-capability-marketplace" className="text-sm font-medium text-indigo-600 hover:underline">Manage Registry →</Link>
                    </CardContent>
                </Card>
                <Card className="shadow-none border-l-4 border-emerald-500">
                    <CardHeader className="pb-2 text-emerald-600">
                        <CardDescription className="flex items-center gap-2 text-emerald-600/80"><CheckCircle className="h-4 w-4" /> Active</CardDescription>
                        <CardTitle className="text-3xl">{health.active}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none border-l-4 border-yellow-500">
                    <CardHeader className="pb-2 text-yellow-600">
                        <CardDescription className="flex items-center gap-2 text-yellow-600/80"><AlertCircle className="h-4 w-4" /> Pending Approval</CardDescription>
                        <CardTitle className="text-3xl">{health.pending}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none border-l-4 border-red-500">
                    <CardHeader className="pb-2 text-red-600">
                        <CardDescription className="flex items-center gap-2 text-red-600/80"><AlertTriangle className="h-4 w-4" /> Deprecated</CardDescription>
                        <CardTitle className="text-3xl">{health.deprecated}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-none">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Code2 className="h-5 w-5 text-indigo-500" /> Language Adoption in SDKs</CardTitle></CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        {Object.entries(lang).map(([l, pct]) => (
                            <div key={l} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold uppercase text-muted-foreground">{l}</span>
                                    <span className="font-mono">{pct}%</span>
                                </div>
                                <Progress value={pct as number} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader><CardTitle className="text-lg">Recent Marketplace Activity</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(stats.audits || []).slice(0, 6).map((a: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm p-3 bg-white dark:bg-slate-900 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{a.entityId}</p>
                                        <p className="text-xs text-muted-foreground">{a.action} by {a.performedBy}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.timestamp).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {(!stats.audits || stats.audits.length === 0) && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
