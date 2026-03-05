'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrainCircuit, Sparkles, Lightbulb, TrendingUp, RefreshCw, Zap } from 'lucide-react';

const API = '/api/plugins/cm-ai-intelligence';
const EMP_API = '/api/plugins/cm-employee-profiles';

export default function AIWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><AIPage /></DashboardLayout>;
}

function AIPage() {
    const [recs, setRecs] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const [r, e] = await Promise.all([
            fetch(API + (selectedEmp ? `?employeeId=${selectedEmp}` : '')).then(r => r.json()),
            fetch(`${EMP_API}?module=employees`).then(r => r.json()),
        ]);
        if (r.data) setRecs(r.data);
        if (r.trendingSkills) setTrending(r.trendingSkills);
        if (e.data) setEmployees(e.data);
        setLoading(false);
    }, [selectedEmp]);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const generate = async () => {
        if (!selectedEmp) return;
        setGenerating(true);
        const r = await fetch(API, { method: 'POST', body: JSON.stringify({ employeeId: selectedEmp }) }).then(r => r.json());
        setGenerating(false);
        fetchAll();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center"><BrainCircuit className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">AI Intelligence</h1><p className="text-sm text-muted-foreground">Skill predictions, recommendations & trend forecasting</p></div>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedEmp} onValueChange={setSelectedEmp}>
                        <SelectTrigger className="w-52"><SelectValue placeholder="Select employee for AI…" /></SelectTrigger>
                        <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={generate} disabled={!selectedEmp || generating}>
                        <Zap className={`h-4 w-4 mr-2 ${generating ? 'animate-pulse' : ''}`} />{generating ? 'Generating…' : 'Generate AI Recs'}
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6 grid lg:grid-cols-3 gap-6">
                {/* AI Recommendations */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Lightbulb className="h-4 w-4" />AI Recommendations</h2>
                    {recs.length === 0 && !loading && (
                        <div className="text-center py-12 border rounded-xl bg-white dark:bg-slate-900/30 text-muted-foreground">
                            <BrainCircuit className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>Select an employee and click "Generate AI Recs" to get personalised gap-based recommendations.</p>
                        </div>
                    )}
                    {recs.map(rec => (
                        <Card key={rec.id} className="shadow-none border-violet-100 dark:border-violet-900/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-violet-500" />Generated {new Date(rec.generatedAt).toLocaleDateString()} by {rec.generatedBy}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rec.gapRecommendations?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 mb-2">Gap-Based Priorities</p>
                                        <div className="space-y-2">
                                            {rec.gapRecommendations.map((r: any) => (
                                                <div key={r.competencyId} className="flex items-start gap-2 text-sm">
                                                    <Badge className={`text-[10px] mt-0.5 shrink-0 ${r.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>{r.priority}</Badge>
                                                    <div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.reason}</p></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {rec.unexploredSkills?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 mb-2">Unexplored Growth Areas</p>
                                        <div className="space-y-2">
                                            {rec.unexploredSkills.slice(0, 4).map((s: any) => (
                                                <div key={s.competencyId} className="flex items-start gap-2 text-sm">
                                                    <Sparkles className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                                                    <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.reason}</p></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {/* Industry Trends */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-4 w-4" />Industry Trends</h2>
                    {trending.map(t => (
                        <Card key={t.competencyId} className="shadow-none">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-semibold text-sm">{t.name}</p>
                                    <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{t.demandGrowth}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{t.reason}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
