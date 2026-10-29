'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Download, RefreshCw, FileBarChart } from 'lucide-react';

const ANALYTICS_API = '/api/plugins/cm-analytics';
const GAP_API = '/api/plugins/cm-skill-gap';
const CERT_API = '/api/plugins/cm-certifications';

export default function ReportsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><ReportsPage /></DashboardLayout>;
}

function ReportsPage() {
    const [analytics, setAnalytics] = useState<any>({});
    const [topGaps, setTopGaps] = useState<any[]>([]);
    const [certs, setCerts] = useState<any[]>([]);

    const fetchAll = useCallback(async () => {
        const [a, g, c] = await Promise.all([
            fetch(ANALYTICS_API).then(r => r.json()),
            fetch(GAP_API).then(r => r.json()),
            fetch(CERT_API).then(r => r.json()),
        ]);
        if (a.data) setAnalytics(a.data);
        if (g.topGaps) setTopGaps(g.topGaps);
        if (c.data) setCerts(c.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const exportCSV = (data: any[], filename: string) => {
        if (!data.length) return;
        const keys = Object.keys(data[0]);
        const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))].join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = filename; a.click();
    };

    const reports = [
        { id: 1, name: 'Org Headcount by Department', desc: `${analytics.empCount || 0} active employees across ${(analytics.byDept || []).length} departments.`, data: analytics.byDept || [], file: 'headcount_by_dept.csv' },
        { id: 2, name: 'Top Skill Gaps', desc: `${topGaps.length} skills with highest gap scores org-wide.`, data: topGaps, file: 'top_skill_gaps.csv' },
        { id: 3, name: 'Certification Status', desc: `${certs.filter(c => c.status === 'expiring_soon').length} expiring soon, ${certs.filter(c => c.status === 'expired').length} expired.`, data: certs, file: 'certification_status.csv' },
        { id: 4, name: 'Pending Skill Validations', desc: `${analytics.validationPending || 0} skills awaiting manager sign-off.`, data: [], file: 'pending_validations.csv' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center"><PieChart className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Reports & Exports</h1><p className="text-sm text-muted-foreground">Generate and export competency management reports</p></div>
                </div>
                <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 overflow-auto p-6 grid md:grid-cols-2 gap-4 content-start">
                {reports.map(r => (
                    <Card key={r.id} className="shadow-none">
                        <CardContent className="p-4 flex items-center gap-4">
                            <FileBarChart className="h-8 w-8 text-rose-400 shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{r.name}</p>
                                <p className="text-xs text-muted-foreground">{r.desc}</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8" onClick={() => exportCSV(r.data, r.file)}>
                                <Download className="h-3.5 w-3.5 mr-1" />CSV
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
