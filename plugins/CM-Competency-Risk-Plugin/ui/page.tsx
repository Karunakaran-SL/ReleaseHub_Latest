'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, AlertOctagon, ShieldCheck, Plus, RefreshCw, Flame } from 'lucide-react';

const API = '/api/plugins/cm-competency-risk';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';

export default function RiskWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><CompetencyRiskPage /></DashboardLayout>;
}

function CompetencyRiskPage() {
    const [risks, setRisks] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [form, setForm] = useState({ id: '', title: '', description: '', criticalCompetencyId: '', riskScore: 50, riskLevel: 'Medium', expertCount: 1, mitigationPlan: '', status: 'open' });
    const [editMitigation, setEditMitigation] = useState('');

    const fetchAll = useCallback(async () => {
        const [r, s] = await Promise.all([fetch(API).then(r => r.json()), fetch(`${SKILL_API}?module=competencies`).then(r => r.json())]);
        if (r.data) setRisks(r.data);
        if (s.data) setCompetencies(s.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const levelColor = (l: string) => l === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : l === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    const scoreBg = (s: number) => s >= 75 ? 'bg-red-500' : s >= 50 ? 'bg-orange-500' : 'bg-yellow-400';

    const save = async () => {
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...form, id: form.id || `CRSK-${Date.now().toString().slice(-4)}` }) });
        setDialogOpen(false);
        fetchAll();
    };

    const updateStatus = async (risk: any, status: string) => {
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...risk, status }) });
        fetchAll();
    };
    const updateMitigation = async (risk: any) => {
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...risk, mitigationPlan: editMitigation }) });
        setSelected(null);
        fetchAll();
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="flex-1 flex flex-col">
                <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-red-100 text-red-700 rounded-lg flex items-center justify-center"><ShieldAlert className="h-5 w-5" /></div>
                        <div><h1 className="text-xl font-bold">Competency Risk</h1><p className="text-sm text-muted-foreground">{risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length} high-priority risks</p></div>
                    </div>
                    <div className="flex gap-2"><Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button><Button className="bg-red-600 hover:bg-red-700" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Log Risk</Button></div>
                </div>
                <div className="flex-1 overflow-auto p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {risks.map(r => (
                        <Card key={r.id} className="shadow-none cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelected(r); setEditMitigation(r.mitigationPlan || ''); }}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <Badge className={`text-[10px] border ${levelColor(r.riskLevel)}`}><Flame className="h-2.5 w-2.5 mr-1" />{r.riskLevel}</Badge>
                                    <span className="text-2xl font-bold text-slate-400">{r.riskScore}</span>
                                </div>
                                <p className="font-semibold text-sm mb-1">{r.title}</p>
                                <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                                    <div className={`h-full rounded-full ${scoreBg(r.riskScore)}`} style={{ width: `${r.riskScore}%` }} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">{r.expertCount} expert(s)</span>
                                    <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            {/* Detail Panel */}
            {selected && (
                <div className="w-96 border-l bg-background flex flex-col">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Risk Detail</h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-auto">
                        <p className="font-semibold">{selected.title}</p>
                        <p className="text-sm text-muted-foreground">{selected.description}</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(selected, 'monitoring')}>Mark Monitoring</Button>
                            <Button size="sm" variant="outline" className="text-xs text-emerald-600" onClick={() => updateStatus(selected, 'resolved')}>Mark Resolved</Button>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Mitigation Plan</Label>
                            <Textarea rows={4} value={editMitigation} onChange={e => setEditMitigation(e.target.value)} />
                            <Button size="sm" onClick={() => updateMitigation(selected)} className="w-full">Save Mitigation</Button>
                        </div>
                    </div>
                </div>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent><DialogHeader><DialogTitle>Log Competency Risk</DialogTitle><DialogDescription>Identify a critical skill shortage risk.</DialogDescription></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5"><Label>Title <span className="text-red-500">*</span></Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>Risk Level</Label>
                                <Select value={form.riskLevel} onValueChange={v => setForm({ ...form, riskLevel: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{['Critical', 'High', 'Medium', 'Low'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5"><Label>Risk Score (0-100)</Label><Input type="number" min={0} max={100} value={form.riskScore} onChange={e => setForm({ ...form, riskScore: +e.target.value })} /></div>
                        </div>
                        <div className="space-y-1.5"><Label>Critical Competency</Label>
                            <Select value={form.criticalCompetencyId} onValueChange={v => setForm({ ...form, criticalCompetencyId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>{competencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Mitigation Plan</Label><Textarea rows={2} value={form.mitigationPlan} onChange={e => setForm({ ...form, mitigationPlan: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.title} className="bg-red-600 hover:bg-red-700">Log Risk</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
