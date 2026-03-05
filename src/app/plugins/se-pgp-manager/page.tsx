'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitMerge, DollarSign, Calendar, CheckSquare, Clock, CheckCircle, Flame, Plus, RefreshCw, Layers } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const API = '/api/plugins/se-pgp-manager';

export default function PGPManagerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><PGPManagerPage /></DashboardLayout>;
}

function PGPManagerPage() {
    const [stats, setStats] = useState<any>({});
    const [pbsList, setPbsList] = useState<any[]>([]);
    const [kdList, setKdList] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);

    // External data from System Composition plugin (if installed)
    const [scFunctions, setScFunctions] = useState<any[]>([]);

    const [tab, setTab] = useState('dashboard');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('pbs'); // pbs, kd, action, linkFn

    const [pbsForm, setPbsForm] = useState({ id: '', name: '', reqs: '', budget: 0, parentId: '' });
    const [kdForm, setKdForm] = useState({ id: '', name: '', owner: '', steps: '' });
    const [actForm, setActForm] = useState({ id: '', description: '', assignee: '', kdId: '' });
    const [selectedEntity, setSelectedEntity] = useState<any>(null); // Used for adding actions to KDs or linking FNs to PBS

    const fetchAll = useCallback(async () => {
        const [dash, pb, kds, acts] = await Promise.all([
            fetch(`${API}?module=dashboard`).then(r => r.json()),
            fetch(`${API}?module=pbs`).then(r => r.json()),
            fetch(`${API}?module=kd`).then(r => r.json()),
            fetch(`${API}?module=actions`).then(r => r.json()),
        ]);
        if (dash.data) setStats(dash.data);
        if (pb.data) setPbsList(pb.data);
        if (kds.data) setKdList(kds.data);
        if (acts.data) setActions(acts.data);

        // Try load SE Composition functions if they exist
        if (dash.data?.hasSystemComp) {
            const fns = await fetch(`/api/plugins/se-system-composition-manager?module=functions`).then(r => r.json()).catch(() => ({ data: [] }));
            if (fns.data) setScFunctions(fns.data);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const seedInit = async () => {
        await fetch(`${API}?module=init`);
        fetchAll();
    };

    const savePbs = async () => {
        await fetch(`${API}?module=pbs`, { method: 'POST', body: JSON.stringify({ ...pbsForm, id: pbsForm.id || `PBS-${Date.now().toString().slice(-4)}` }) });
        setDialogOpen(false); fetchAll();
    };

    const saveKd = async () => {
        const stepsArr = kdForm.steps.split('\n').map(s => s.trim()).filter(Boolean);
        await fetch(`${API}?module=kd`, { method: 'POST', body: JSON.stringify({ ...kdForm, id: kdForm.id || `KD-${Date.now().toString().slice(-4)}`, steps: stepsArr, status: 'Pending' }) });
        setDialogOpen(false); fetchAll();
    };

    const saveAct = async () => {
        await fetch(`${API}?module=actions`, { method: 'POST', body: JSON.stringify({ ...actForm, id: actForm.id || `ACT-${Date.now().toString().slice(-4)}`, kdId: selectedEntity.id, status: 'Pending' }) });
        setDialogOpen(false); fetchAll();
    };

    const changeKdAction = async (kdId: string, actionStr: string) => {
        await fetch(`${API}?module=kd&id=${kdId}&action=${actionStr}`, { method: 'PUT' });
        fetchAll();
    };

    const changeActionStatus = async (actId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Pending' ? 'In Progress' : currentStatus === 'In Progress' ? 'Done' : 'Pending';
        await fetch(`${API}?module=actions&id=${actId}&action=updateStatus`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
        fetchAll();
    };

    const openDialog = (type: string, entity?: any) => {
        setDialogType(type);
        if (entity) setSelectedEntity(entity);
        setPbsForm({ id: '', name: '', reqs: '', budget: 0, parentId: '' });
        setKdForm({ id: '', name: '', owner: '', steps: '' });
        setActForm({ id: '', description: '', assignee: '', kdId: '' });
        setDialogOpen(true);
    };

    const getKdActions = (kdId: string) => actions.filter(a => a.kdId === kdId);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center"><GitMerge className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">PGP Manager</h1><p className="text-sm text-muted-foreground">Product Generation Process & Decisions</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={seedInit}><RefreshCw className="h-4 w-4 mr-2" />Seed Demo</Button>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="p-4 pb-0">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="pbs">PBS Tree</TabsTrigger>
                        <TabsTrigger value="kd">Key Decisions</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-auto p-6 pt-4">
                {tab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="shadow-none"><CardContent className="p-4 flex items-center gap-3"><Layers className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">{stats.pbsTotal || 0}</p><p className="text-xs text-muted-foreground">Total PBS Items</p></div></CardContent></Card>
                            <Card className="shadow-none"><CardContent className="p-4 flex items-center gap-3"><DollarSign className="h-8 w-8 text-indigo-500" /><div><p className="text-2xl font-bold">${(stats.budget || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Budget Allocated</p></div></CardContent></Card>
                            <Card className="shadow-none"><CardContent className="p-4 flex items-center gap-3"><Flame className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{actions.filter(a => a.status !== 'Done').length}</p><p className="text-xs text-muted-foreground">Pending Actions</p></div></CardContent></Card>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-4">
                            <Card className="shadow-none">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm mb-3">KD Status Breakdown</h3>
                                    <div className="flex gap-4">
                                        {['Pending', 'In Progress', 'Closed'].map(status => {
                                            const st = (stats.kdStats || []).find((s: any) => s._id === status);
                                            const total = (stats.kdStats || []).reduce((acc: number, s: any) => acc + (s.count || 0), 0) || 1;
                                            const val = st?.count || 0;
                                            const pct = Math.round((val / total) * 100);
                                            return (
                                                <div key={status} className="flex-1 text-center bg-slate-50 dark:bg-slate-900 border rounded-lg p-4">
                                                    <p className="text-2xl font-bold">{val}</p><p className="text-xs text-muted-foreground mb-2">{status}</p>
                                                    <Progress value={pct} className="h-2" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm mb-3">Integration Status</h3>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border rounded p-4">
                                        <div className={`h-10 w-10 text-white rounded-full flex items-center justify-center ${stats.hasSystemComp ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">System Composition Linking</p>
                                            <p className="text-xs text-muted-foreground">{stats.hasSystemComp ? 'Active: Technical Functions can be linked directly to PBS nodes.' : 'Not available. Install System Composition Manager for full traceability.'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {tab === 'pbs' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">Product Breakdown Structures (PBS)</p>
                            <Button size="sm" onClick={() => openDialog('pbs')}><Plus className="h-3 w-3 mr-1" /> Add PBS</Button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden">
                            {pbsList.map(p => (
                                <div key={p.id} className={`p-4 border-b last:border-0 ${p.parentId ? 'ml-8 bg-slate-50 dark:bg-slate-800/30' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs text-muted-foreground">{p.id}</span>
                                                <p className="font-bold">{p.name}</p>
                                            </div>
                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                <span>Budget: ${p.budget?.toLocaleString()}</span>
                                                {p.reqs && <span>Reqs: {p.reqs}</span>}
                                            </div>
                                            {stats.hasSystemComp && p.functionDetails && p.functionDetails.length > 0 && (
                                                <div className="mt-2 text-xs flex items-center gap-2">
                                                    <span className="text-indigo-600 font-medium whitespace-nowrap">Mapped Functions:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {p.functionDetails.map((f: any) => <Badge key={f.id} variant="outline" className="text-[9px] bg-white">{f.name}</Badge>)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'kd' && (
                    <div className="space-y-4">
                        <div className="flex justify-end"><Button size="sm" onClick={() => openDialog('kd')}><Plus className="h-3 w-3 mr-1" /> New KD</Button></div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kdList.map(k => {
                                const acts = getKdActions(k.id);
                                return (
                                    <Card key={k.id} className="shadow-none">
                                        <CardContent className="p-0">
                                            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 border-b">
                                                <div className="flex justify-between mb-1">
                                                    <Badge className={`text-[10px] ${k.status === 'Pending' ? 'bg-slate-500' : k.status === 'Closed' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{k.status}</Badge>
                                                    <span className="font-mono text-xs text-muted-foreground">{k.id}</span>
                                                </div>
                                                <p className="font-bold text-sm mb-1">{k.name}</p>
                                                <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 font-medium">Owner: {k.owner}</p>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {/* KD Actions / Steps progress */}
                                                {k.steps && k.steps.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Agreed Steps</p>
                                                        <ul className="list-disc pl-4 text-xs text-slate-700 dark:text-slate-300">
                                                            {k.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="border-t pt-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Action Tracker</p>
                                                        <Button variant="ghost" size="sm" className="h-5 p-0 text-xs text-indigo-600" onClick={() => openDialog('action', k)}><Plus className="h-3 w-3 mr-1" /> Action</Button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {acts.length === 0 && <p className="text-xs text-muted-foreground italic">No actions defined.</p>}
                                                        {acts.map(a => (
                                                            <div key={a.id} className="flex justify-between items-start bg-slate-50 dark:bg-slate-900 border p-2 rounded cursor-pointer hover:bg-slate-100" onClick={() => changeActionStatus(a.id, a.status)}>
                                                                <div className="flex-1">
                                                                    <p className={`text-xs ${a.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>{a.description}</p>
                                                                    <p className="text-[10px] text-muted-foreground mt-0.5">@{a.assignee}</p>
                                                                </div>
                                                                <Badge variant="outline" className={`text-[9px] ${a.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : ''}`}>{a.status}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 border-t pt-3">
                                                    {k.status === 'Pending' && <Button size="sm" className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => changeKdAction(k.id, 'conduct')}>Conduct KD</Button>}
                                                    {k.status === 'In Progress' && <Button size="sm" className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => changeKdAction(k.id, 'close')}>Close KD</Button>}
                                                    {k.status === 'Closed' && <div className="flex-1 text-center text-xs text-emerald-600 font-bold bg-emerald-50 py-1 rounded">Decision Complete ✓</div>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === 'pbs' ? 'Create PBS Node' : dialogType === 'kd' ? 'Create Key Decision' : 'Add Tracking Action'}
                        </DialogTitle>
                    </DialogHeader>

                    {dialogType === 'pbs' && (
                        <div className="space-y-3 py-2">
                            <div><Label>Name</Label><Input value={pbsForm.name} onChange={e => setPbsForm({ ...pbsForm, name: e.target.value })} /></div>
                            <div><Label>Parent PBS (Optional)</Label>
                                <Select value={pbsForm.parentId} onValueChange={v => setPbsForm({ ...pbsForm, parentId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Root Level" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Root Level</SelectItem>
                                        {pbsList.map(p => <SelectItem key={p.id} value={p.id}>{p.id} - {p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label>Allocated Budget</Label><Input type="number" value={pbsForm.budget} onChange={e => setPbsForm({ ...pbsForm, budget: Number(e.target.value) })} /></div>
                                <div><Label>Compliance/Reqs</Label><Input value={pbsForm.reqs} onChange={e => setPbsForm({ ...pbsForm, reqs: e.target.value })} placeholder="e.g. ISO26262" /></div>
                            </div>
                            <Button onClick={savePbs} className="w-full">Create PBS</Button>
                        </div>
                    )}

                    {dialogType === 'kd' && (
                        <div className="space-y-3 py-2">
                            <div><Label>Decision Title / Event</Label><Input value={kdForm.name} onChange={e => setKdForm({ ...kdForm, name: e.target.value })} placeholder="e.g. Architecture Signoff v2" /></div>
                            <div><Label>Owner / Lead</Label><Input value={kdForm.owner} onChange={e => setKdForm({ ...kdForm, owner: e.target.value })} placeholder="e.g. System Architect" /></div>
                            <div><Label>Required Steps (one per line)</Label><Textarea rows={4} value={kdForm.steps} onChange={e => setKdForm({ ...kdForm, steps: e.target.value })} placeholder="Define safety goals&#10;Map building blocks&#10;Draft technical interfaces" /></div>
                            <Button onClick={saveKd} className="w-full" disabled={!kdForm.name}>Plan KD</Button>
                        </div>
                    )}

                    {dialogType === 'action' && selectedEntity && (
                        <div className="space-y-3 py-2">
                            <p className="text-sm border p-2 bg-slate-50 text-indigo-700 rounded font-medium mb-2">Adding Action to: {selectedEntity.name}</p>
                            <div><Label>Action Description</Label><Input value={actForm.description} onChange={e => setActForm({ ...actForm, description: e.target.value })} /></div>
                            <div><Label>Assignee</Label><Input value={actForm.assignee} onChange={e => setActForm({ ...actForm, assignee: e.target.value })} placeholder="e.g. David / Cloud Team" /></div>
                            <Button onClick={saveAct} className="w-full" disabled={!actForm.description}>Add Tracker Item</Button>
                        </div>
                    )}

                </DialogContent>
            </Dialog>
        </div>
    );
}
