'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GitMerge, DollarSign, Flame, Layers } from 'lucide-react';
import Link from 'next/link';

const API = '/api/plugins/se-pgp-manager?module=dashboard';
const ACT_API = '/api/plugins/se-pgp-manager?module=actions';

export default function PGPDashboardWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><PGPDashboardPage /></DashboardLayout>;
}

function PGPDashboardPage() {
    const [stats, setStats] = useState<any>({});
    const [actions, setActions] = useState<any[]>([]);

    useEffect(() => {
        fetch(API).then(r => r.json()).then(r => { if (r.data) setStats(r.data); });
        fetch(ACT_API).then(r => r.json()).then(r => { if (r.data) setActions(r.data); });
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">PGP Overview</h1>
                <p className="text-muted-foreground">Product Generation Process health, pending key decisions, and action items.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-sm border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2"><Layers className="h-4 w-4" /> Total PBS Nodes</CardDescription>
                        <CardTitle className="text-4xl">{stats.pbsTotal || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link href="/plugins/se-pgp-manager" className="text-sm font-medium text-emerald-600 hover:underline">Manage Structure →</Link>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Budget Allocated</CardDescription>
                        <CardTitle className="text-4xl">${(stats.budget || 0).toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2"><Flame className="h-4 w-4" /> Pending Actions</CardDescription>
                        <CardTitle className="text-4xl">{actions.filter(a => a.status !== 'Done').length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="shadow-none">
                <CardHeader><CardTitle className="text-lg">Key Decision (KD) Pipeline Status</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                        {['Pending', 'In Progress', 'Closed'].map(status => {
                            const st = (stats.kdStats || []).find((s: any) => s._id === status);
                            const total = (stats.kdStats || []).reduce((acc: number, s: any) => acc + (s.count || 0), 0) || 1;
                            const val = st?.count || 0;
                            const pct = Math.round((val / total) * 100);
                            return (
                                <div key={status} className="flex-1 text-center bg-white dark:bg-slate-900 border rounded-lg p-6">
                                    <p className="text-3xl font-bold">{val}</p>
                                    <p className="text-sm text-muted-foreground mb-4">{status}</p>
                                    <Progress value={pct} className={`h-2 ${status === 'Closed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : ''}`} />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
