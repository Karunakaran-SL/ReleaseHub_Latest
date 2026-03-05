'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, AlertTriangle, BarChart2, Users, RefreshCw } from 'lucide-react';

const GAP_API = '/api/plugins/cm-skill-gap';
const EMP_API = '/api/plugins/cm-employee-profiles';

export default function GapWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><GapAnalysisPage /></DashboardLayout>;
}

function GapAnalysisPage() {
    const [gaps, setGaps] = useState<any[]>([]);
    const [topGaps, setTopGaps] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmp, setSelectedEmp] = useState('');
    const LEVELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

    const fetchAll = useCallback(async () => {
        const [g, e] = await Promise.all([
            fetch(GAP_API + (selectedEmp ? `?employeeId=${selectedEmp}` : '')).then(r => r.json()),
            fetch(`${EMP_API}?module=employees`).then(r => r.json()),
        ]);
        if (g.data) setGaps(g.data);
        if (g.topGaps) setTopGaps(g.topGaps);
        if (e.data) setEmployees(e.data);
    }, [selectedEmp]);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const getEmpName = (id: string) => employees.find(e => e.id === id)?.name || id;
    const severityColor = (gap: number) => gap >= 3 ? 'bg-red-500' : gap >= 2 ? 'bg-orange-500' : 'bg-yellow-400';

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center"><TrendingDown className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Skill Gap Analysis</h1><p className="text-sm text-muted-foreground">Role vs actual skill benchmarking</p></div>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedEmp} onValueChange={setSelectedEmp}>
                        <SelectTrigger className="w-52"><SelectValue placeholder="All employees" /></SelectTrigger>
                        <SelectContent><SelectItem value="">All Employees</SelectItem>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6 grid lg:grid-cols-3 gap-6">
                {/* Individual Gap Reports */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Individual Gaps</h2>
                    {gaps.length === 0 && <div className="text-center py-12 border rounded-xl bg-white dark:bg-slate-900/30 text-muted-foreground">No gap analyses found.</div>}
                    {gaps.map(g => (
                        <Card key={g.id} className="shadow-none">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-semibold">{getEmpName(g.employeeId)}</p>
                                        <p className="text-xs text-muted-foreground">Role: {g.roleId} · Total gap score: <span className="font-bold text-rose-600">{g.totalGap}</span></p>
                                    </div>
                                    <Badge className={`${g.totalGap >= 5 ? 'bg-red-100 text-red-700' : g.totalGap >= 3 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'} border-0`}>
                                        {g.totalGap >= 5 ? 'Critical' : g.totalGap >= 3 ? 'High' : 'Medium'}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {(g.gaps || []).map((gap: any) => (
                                        <div key={gap.competencyId} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>{gap.name}</span>
                                                    <span className="text-muted-foreground">L{gap.currentLevel} → L{gap.requiredLevel}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(l => (
                                                        <div key={l} className={`h-2 flex-1 rounded-sm ${l <= gap.currentLevel ? 'bg-emerald-400' : l <= gap.requiredLevel ? 'bg-rose-200' : 'bg-slate-100'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${severityColor(gap.gap)}`}>–{gap.gap}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {/* Org Top Gaps */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><BarChart2 className="h-4 w-4" />Org Top Gaps</h2>
                    {topGaps.map((g, i) => (
                        <div key={g._id} className="bg-white dark:bg-slate-900/30 rounded-xl p-3 border flex items-center gap-3">
                            <span className="text-2xl font-bold text-rose-300 w-6">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{g.name || g._id}</p>
                                <p className="text-xs text-muted-foreground"><Users className="h-2.5 w-2.5 inline mr-0.5" />{g.affectedEmployees} employees · gap: {g.totalGap}</p>
                            </div>
                            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
