'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, Plus, Shield, ShieldCheck, Thermometer, AlertTriangle, Edit2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RisksManagerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex-1 p-4 md:p-8 pt-6 h-full flex flex-col">
                <RisksManager user={user} />
            </div>
        </DashboardLayout>
    );
}

const RISK_STATUSES = ['Open', 'Monitoring', 'Mitigated', 'Closed'];

function RisksManager({ user }: { user: User | null }) {
    const [risks, setRisks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<any | null>(null);

    const newDefault = { title: '', probability: 3, impact: 3, mitigation: '', team: '', comment: '' };
    const [form, setForm] = useState({ ...newDefault });

    const fetchRisks = () => {
        fetch('/api/plugins/3iab-product-management?module=risks')
            .then(r => r.json())
            .then(res => { if (res.data) setRisks(res.data); })
            .finally(() => setLoading(false));
    };
    useEffect(() => { fetchRisks(); }, []);

    const save = async (payload: any) => {
        const score = parseInt(payload.probability) * parseInt(payload.impact);
        await fetch('/api/plugins/3iab-product-management?module=risk', {
            method: 'POST',
            body: JSON.stringify({ ...payload, score })
        });
        fetchRisks();
    };

    const submitCreate = async () => {
        if (!form.title || !form.mitigation) return;
        await save({
            id: `RSK-${Date.now().toString().slice(-5)}`,
            title: form.title,
            status: 'Open',
            probability: form.probability,
            impact: form.impact,
            owner: user?.username || user?.email || 'Admin',
            team: form.team,
            mitigation: form.mitigation,
            audit: `Logged by ${user?.username || 'User'}`
        });
        setCreateOpen(false);
        setForm({ ...newDefault });
    };

    const submitEdit = async () => {
        if (!editTarget) return;
        await save({
            ...editTarget,
            probability: form.probability,
            impact: form.impact,
            mitigation: form.mitigation,
            status: editTarget.status,
            audit: form.comment
                ? `Updated: ${form.comment}` :
                `Updated by ${user?.username || 'User'}`
        });
        setEditOpen(false);
    };

    const toggleStatus = async (risk: any) => {
        const next = risk.status === 'Mitigated' ? 'Open' : 'Mitigated';
        await save({ ...risk, status: next, audit: `Status changed to ${next}` });
    };

    const openEdit = (risk: any) => {
        setEditTarget(risk);
        setForm({
            title: risk.title,
            probability: risk.probability,
            impact: risk.impact,
            mitigation: risk.mitigation,
            team: risk.team || '',
            comment: ''
        });
        setEditTarget(risk);
        setEditOpen(true);
    };

    const getScoreColor = (score: number) => {
        if (score >= 15) return 'bg-red-100 text-red-700 border-red-200';
        if (score >= 10) return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    const filtered = filterStatus === 'All' ? risks : risks.filter(r => r.status === filterStatus);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-background rounded-xl border overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-background px-6 py-5 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-rose-100 text-rose-700 flex items-center justify-center rounded-lg border border-rose-200">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Enterprise Risk Registry</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Track, audit, and mitigate 3iaB risks</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                        <TabsList>
                            <TabsTrigger value="All">All</TabsTrigger>
                            <TabsTrigger value="Open">Open</TabsTrigger>
                            <TabsTrigger value="Monitoring">Monitoring</TabsTrigger>
                            <TabsTrigger value="Mitigated">Mitigated</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => { setForm({ ...newDefault }); setCreateOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Log Risk
                    </Button>
                </div>
            </div>

            {/* Risks list */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
                {loading && <div className="text-center p-8 text-muted-foreground">Loading risks...</div>}
                {!loading && filtered.length === 0 && (
                    <div className="text-center p-12 border rounded-xl bg-white dark:bg-slate-900/50">
                        <ShieldAlert className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                        <p className="text-muted-foreground">No risks found. Click "Log Risk" to register one.</p>
                    </div>
                )}
                {!loading && filtered.map(risk => (
                    <div key={risk.id} className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden flex group">
                        {/* Status strip */}
                        <div className={`w-2 ${risk.score >= 15 && risk.status !== 'Mitigated' ? 'bg-red-500' : risk.status === 'Mitigated' ? 'bg-emerald-500' : risk.status === 'Monitoring' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                        <div className="flex-1 p-5 flex flex-col md:flex-row gap-6">
                            {/* Main details */}
                            <div className="flex-1">
                                <div className="flex items-start gap-2 mb-1 flex-wrap">
                                    <Badge variant="outline" className="font-mono text-[10px] tracking-wider">{risk.id}</Badge>
                                    {risk.team && <Badge variant="outline" className="font-mono text-[10px] tracking-wider">{risk.team}</Badge>}
                                    {/* Clickable status badge */}
                                    <button
                                        onClick={() => toggleStatus(risk)}
                                        title="Click to toggle Mitigated / Open"
                                        className="focus:outline-none">
                                        {risk.status === 'Mitigated' ? (
                                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer">
                                                <ShieldCheck className="h-3 w-3 mr-1" /> Mitigated
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer shadow-none">
                                                <AlertTriangle className="h-3 w-3 mr-1" /> {risk.status}
                                            </Badge>
                                        )}
                                    </button>
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-3">{risk.title}</h3>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm mb-3">
                                    <span className="font-semibold block mb-1 text-xs text-muted-foreground uppercase tracking-wide">Mitigation Strategy</span>
                                    <span className="text-muted-foreground">{risk.mitigation}</span>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 border-t pt-3">
                                    <Shield className="h-3 w-3" /> {risk.audit}
                                </div>
                            </div>

                            {/* Scoring block */}
                            <div className="w-full md:w-52 shrink-0 flex flex-col justify-center border-l pl-5">
                                <span className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider flex items-center gap-1">
                                    <Thermometer className="h-3.5 w-3.5" /> Risk Matrix
                                </span>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                            <span>Probability</span>
                                            <span className="font-mono font-bold text-foreground">{risk.probability}/5</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-400" style={{ width: `${(risk.probability / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                            <span>Impact</span>
                                            <span className="font-mono font-bold text-foreground">{risk.impact}/5</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-600" style={{ width: `${(risk.impact / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between items-center text-sm font-semibold">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Exposure</span>
                                            <div className={`h-8 w-10 flex items-center justify-center rounded-md border font-bold font-mono text-sm ${getScoreColor(risk.score)}`}>
                                                {risk.score}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Edit button */}
                                <Button variant="outline" size="sm" className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(risk)}>
                                    <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE DIALOG */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log an Enterprise Risk</DialogTitle>
                        <DialogDescription>Capture a risk item with its probability, impact, and mitigation plan.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Risk Title <span className="text-red-500">*</span></Label>
                            <Input placeholder="e.g. Legacy API deprecation dependency" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label>Probability (1–5)</Label>
                                <Select value={String(form.probability)} onValueChange={v => setForm({ ...form, probability: parseInt(v) })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Impact (1–5)</Label>
                                <Select value={String(form.impact)} onValueChange={v => setForm({ ...form, impact: parseInt(v) })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Team (optional)</Label>
                                <Input placeholder="3IAB-01" value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} />
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg text-sm text-center text-muted-foreground font-mono">
                            Exposure Score: <span className="font-bold text-foreground">{form.probability * form.impact}</span>
                            {form.probability * form.impact >= 15 && <span className="text-red-600 ml-2">⚠ High Risk</span>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Mitigation Strategy <span className="text-red-500">*</span></Label>
                            <Textarea placeholder="How do we monitor or resolve this risk?" rows={3} value={form.mitigation} onChange={e => setForm({ ...form, mitigation: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button className="bg-rose-600 hover:bg-rose-700" onClick={submitCreate} disabled={!form.title || !form.mitigation}>Submit Risk</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Risk {editTarget?.id}</DialogTitle>
                        <DialogDescription>Update risk details, scores, or change its status.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Select value={editTarget?.status} onValueChange={v => setEditTarget((p: any) => ({ ...p, status: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {RISK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Probability (1–5)</Label>
                                <Select value={String(form.probability)} onValueChange={v => setForm({ ...form, probability: parseInt(v) })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Impact (1–5)</Label>
                                <Select value={String(form.impact)} onValueChange={v => setForm({ ...form, impact: parseInt(v) })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg text-sm text-center font-mono text-muted-foreground">
                            New Exposure: <span className="font-bold text-foreground">{form.probability * form.impact}</span>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Mitigation Strategy</Label>
                            <Textarea rows={3} value={form.mitigation} onChange={e => setForm({ ...form, mitigation: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Update Comment / Audit Note</Label>
                            <Input placeholder="e.g. Reviewed in WK13 sync – escalating" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button className="bg-rose-600 hover:bg-rose-700" onClick={submitEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
