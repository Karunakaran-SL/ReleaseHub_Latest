'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, BookOpen, Award, TrendingDown, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API = '/api/plugins/cm-analytics';

export default function AnalyticsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><AnalyticsPage /></DashboardLayout>;
}

function AnalyticsPage() {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const r = await fetch(API).then(r => r.json());
        if (r.data) setData(r.data);
        setLoading(false);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const stats = [
        { label: 'Active Employees', value: data.empCount, icon: Users, color: 'text-blue-600 bg-blue-50' },
        { label: 'Skills in Library', value: data.skillCount, icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
        { label: 'Valid Certifications', value: data.certCount, icon: Award, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Pending Validations', value: data.validationPending, icon: Shield, color: 'text-orange-600 bg-orange-50' },
    ];
    const maxCoverage = Math.max(...(data.skillCoverage || []).map((s: any) => s.holderCount), 1);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center"><BarChart3 className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Workforce Analytics</h1><p className="text-sm text-muted-foreground">Organisation-wide competence intelligence</p></div>
                </div>
                <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {loading && <div className="text-center py-16 text-muted-foreground">Loading analytics…</div>}
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(s => (
                        <Card key={s.label} className="shadow-none">
                            <CardContent className="py-4 px-5 flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
                                <div><p className="text-2xl font-bold">{s.value ?? '–'}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Departments */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Headcount by Department</CardTitle></CardHeader>
                        <CardContent>
                            {(data.byDept || []).map((d: any) => (
                                <div key={d._id} className="flex items-center gap-3 mb-2">
                                    <span className="text-sm w-36 truncate text-muted-foreground">{d._id || 'Unknown'}</span>
                                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(d.count / (data.empCount || 1)) * 100}%` }} />
                                    </div>
                                    <span className="text-sm font-bold w-6 text-right">{d.count}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    {/* Skill Coverage */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Top Skills by Employee Coverage</CardTitle></CardHeader>
                        <CardContent>
                            {(data.skillCoverage || []).map((s: any) => (
                                <div key={s._id} className="flex items-center gap-3 mb-2">
                                    <span className="text-sm w-8 shrink-0 font-mono text-muted-foreground">{s._id?.replace('COMP-', '')}</span>
                                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-400 rounded-full" style={{ width: `${(s.holderCount / maxCoverage) * 100}%` }} />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-20 text-right">{s.holderCount} emp · L{s.avgLevel?.toFixed(1)}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
