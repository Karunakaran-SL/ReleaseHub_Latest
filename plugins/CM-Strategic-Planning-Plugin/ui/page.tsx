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
import { Target, Plus, RefreshCw, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const API = '/api/plugins/cm-strategic-planning';

export default function StrategicWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><StrategicPage /></DashboardLayout>;
}

function StrategicPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ id: '', title: '', description: '', targetYear: new Date().getFullYear() + 1, budget: 0, status: 'planning', owner: '' });

    const fetchAll = useCallback(async () => {
        const r = await fetch(API).then(r => r.json());
        if (r.data) setPlans(r.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const save = async () => {
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...form, id: form.id || `SP-${Date.now().toString().slice(-4)}`, budgetSpent: 0 }) });
        setDialog(false); setForm({ id: '', title: '', description: '', targetYear: new Date().getFullYear() + 1, budget: 0, status: 'planning', owner: '' });
        fetchAll();
    };

    const statusColor = (s: string) => s === 'active' ? 'bg-emerald-50 text-emerald-700' : s === 'planning' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700';

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center"><Target className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Strategic Skill Planning</h1><p className="text-sm text-muted-foreground">{plans.filter(p => p.status === 'active').length} active initiatives</p></div>
                </div>
                <div className="flex gap-2"><Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button><Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setDialog(true)}><Plus className="h-4 w-4 mr-2" />New Plan</Button></div>
            </div>
            <div className="flex-1 overflow-auto p-6 grid md:grid-cols-2 gap-4 content-start">
                {plans.map(p => {
                    const pct = p.budget > 0 ? Math.round((p.budgetSpent / p.budget) * 100) : 0;
                    return (
                        <Card key={p.id} className="shadow-none">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <Badge className={`text-[10px] border ${statusColor(p.status)}`}>{p.status}</Badge>
                                    <span className="text-xs text-muted-foreground">Target: {p.targetYear}</span>
                                </div>
                                <p className="font-semibold text-sm mb-1">{p.title}</p>
                                <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Budget</span>
                                        <span className="font-medium">${(p.budgetSpent || 0).toLocaleString()} / ${(p.budget || 0).toLocaleString()}</span>
                                    </div>
                                    <Progress value={pct} className="h-2" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Owner: {p.owner}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <Dialog open={dialog} onOpenChange={setDialog}>
                <DialogContent><DialogHeader><DialogTitle>New Strategic Plan</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5"><Label>Title <span className="text-red-500">*</span></Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI Upskilling Initiative 2026" /></div>
                        <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5"><Label>Target Year</Label><Input type="number" value={form.targetYear} onChange={e => setForm({ ...form, targetYear: +e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Budget ($)</Label><Input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: +e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Status</Label>
                                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{['planning', 'active', 'completed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5"><Label>Owner</Label><Input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="e.g. Head of Engineering" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={save} disabled={!form.title} className="bg-purple-600 hover:bg-purple-700">Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
