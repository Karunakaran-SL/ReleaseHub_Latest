'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Layers, Cpu, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const API = '/api/plugins/se-system-composition-manager?module=dashboard';

export default function SECDashboardWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><SECDashboardPage /></DashboardLayout>;
}

function SECDashboardPage() {
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        fetch(API).then(r => r.json()).then(r => { if (r.data) setStats(r.data); });
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">System Composition Overview</h1>
                <p className="text-muted-foreground">High-level architectural metrics and recent changes across all defined systems.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-sm border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2"><Server className="h-4 w-4" /> Systems Defined</CardDescription>
                        <CardTitle className="text-4xl">{stats.sysCount || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link href="/plugins/se-system-composition-manager" className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1">Manage Systems <ArrowRight className="h-3 w-3" /></Link>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2"><Layers className="h-4 w-4" /> Products</CardDescription>
                        <CardTitle className="text-4xl">{stats.prodCount || 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-violet-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2"><Cpu className="h-4 w-4" /> Building Blocks</CardDescription>
                        <CardTitle className="text-4xl">{stats.bbCount || 0}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-none">
                    <CardHeader><CardTitle className="text-lg">Recent Architectural Changes</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(stats.recentAudit || []).slice(0, 5).map((a: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-900 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{a.entityId}</p>
                                            <p className="text-xs text-muted-foreground">{a.performedBy}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="text-[10px] mb-1 block">{a.action}</Badge>
                                        <span className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {(!stats.recentAudit || stats.recentAudit.length === 0) && <p className="text-sm text-muted-foreground">No recent changes.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader><CardTitle className="text-lg">Functional Groups</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {(stats.bbGroups || []).map((g: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-900 border rounded-lg">
                                    <span className="font-medium text-indigo-700 dark:text-indigo-400">{g._id || 'Unassigned'}</span>
                                    <Badge>{g.count} blocks</Badge>
                                </div>
                            ))}
                            {(!stats.bbGroups || stats.bbGroups.length === 0) && <p className="text-sm text-muted-foreground">No functional groups defined.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
