'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Plus, AlertCircle, ArrowDown, CalendarDays, Edit2, Trash } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ActionsManagerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex-1 p-4 md:p-8 pt-6 h-full flex flex-col">
                <ActionsManager />
            </div>
        </DashboardLayout>
    );
}

const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['Open', 'In Progress', 'Blocked', 'Closed'];

function ActionsManager() {
    const [actions, setActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<any | null>(null);
    const newDefault = { title: '', notes: '', priority: 'Medium', assignee: '', team: '', dueDate: '' };
    const [form, setForm] = useState({ ...newDefault });

    const fetchActions = () => {
        fetch('/api/plugins/3iab-product-management?module=actions')
            .then(r => r.json())
            .then(res => { if (res.data) setActions(res.data); })
            .finally(() => setLoading(false));
    };
    useEffect(() => { fetchActions(); }, []);

    const save = async (payload: any) => {
        await fetch('/api/plugins/3iab-product-management?module=actions', { method: 'POST', body: JSON.stringify(payload) });
        fetchActions();
    };

    const submitCreate = async () => {
        if (!form.title || !form.assignee || !form.dueDate) return;
        await save({ id: `ACT-${Date.now().toString().slice(-5)}`, title: form.title, notes: form.notes, status: 'Open', priority: form.priority, team: form.team, assignee: form.assignee, source: 'Manual Entry', dueDate: form.dueDate });
        setCreateOpen(false);
        setForm({ ...newDefault });
    };

    const submitEdit = async () => {
        if (!editTarget) return;
        await save({ ...editTarget, ...form });
        setEditOpen(false);
    };

    const toggleStatus = async (action: any) => {
        await save({ ...action, status: action.status === 'Closed' ? 'Open' : 'Closed' });
    };

    const openEdit = (action: any) => {
        setEditTarget(action);
        setForm({ title: action.title, notes: action.notes || '', priority: action.priority, assignee: action.assignee, team: action.team || '', dueDate: action.dueDate });
        setEditOpen(true);
    };

    const filtered = actions.filter(a => {
        if (filterStatus !== 'All' && a.status !== filterStatus) return false;
        if (filterPriority !== 'All' && a.priority !== filterPriority) return false;
        return true;
    });

    const priorityClass = (p: string) => p === 'High' ? 'text-red-600' : p === 'Medium' ? 'text-amber-600' : 'text-blue-500';
    const statusClass = (s: string) => s === 'Closed' ? 'bg-slate-100 text-slate-500' : s === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : s === 'Blocked' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200';

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center border border-blue-200">
                        <CheckSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">3iaB Actions Tracker</h2>
                        <p className="text-sm text-muted-foreground">Follow-up items from Weekly Syncs and MoMs</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Priorities</SelectItem>
                            {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setForm({ ...newDefault }); setCreateOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> New Action
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto border rounded-xl bg-background shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 border-b">
                        <tr>
                            <th className="px-4 py-3 w-8"></th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Action</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground w-32">Status</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground w-24">Priority</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground w-44">Assignee</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground w-32">Due</th>
                            <th className="px-4 py-3 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700 dark:text-slate-300">
                        {loading && <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">Loading...</td></tr>}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={7} className="text-center p-10 text-muted-foreground">
                                {actions.length > 0 ? 'No actions match your filters.' : 'No actions yet. Click "New Action" to log one.'}
                            </td></tr>
                        )}
                        {!loading && filtered.map(action => (
                            <tr key={action.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group ${action.status === 'Closed' ? 'opacity-60' : ''}`}>
                                <td className="px-4 py-4">
                                    <div className="cursor-pointer" onClick={() => toggleStatus(action)} title={action.status === 'Closed' ? 'Re-open' : 'Mark Closed'}>
                                        {action.status === 'Closed'
                                            ? <CheckSquare className="h-4 w-4 text-emerald-500 hover:text-slate-400" />
                                            : <div className="h-4 w-4 rounded border-2 border-slate-300 hover:border-blue-500 transition-colors" />}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className={`font-medium text-foreground ${action.status === 'Closed' ? 'line-through text-muted-foreground' : ''}`}>{action.title}</div>
                                    {action.notes && <div className="text-xs text-muted-foreground mt-0.5">{action.notes}</div>}
                                    <div className="text-xs font-mono text-muted-foreground mt-0.5">{action.id}{action.team ? ` · ${action.team}` : ''}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <Badge variant="outline" className={`text-xs ${statusClass(action.status)}`}>{action.status}</Badge>
                                </td>
                                <td className="px-4 py-4">
                                    <div className={`flex items-center gap-1 text-xs font-medium ${priorityClass(action.priority)}`}>
                                        {action.priority === 'Low' ? <ArrowDown className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                        {action.priority}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                                                {action.assignee?.substring(0, 2)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{action.assignee}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />{action.dueDate}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(action)}>
                                            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CREATE DIALOG */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Follow-up Action</DialogTitle>
                        <DialogDescription>Log an action item from a 3iaB sync or MoM meeting.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Action Title <span className="text-red-500">*</span></Label>
                            <Input placeholder="e.g. Update Kubernetes cluster limits" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Assignee <span className="text-red-500">*</span></Label>
                                <Input placeholder="e.g. David Cho" value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Due Date <span className="text-red-500">*</span></Label>
                                <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Priority</Label>
                                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Team (optional)</Label>
                                <Input placeholder="e.g. 3IAB-01" value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes (optional)</Label>
                            <Textarea placeholder="Additional context…" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitCreate} disabled={!form.title || !form.assignee || !form.dueDate}>Save Action</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Action</DialogTitle>
                        <DialogDescription>Update details for {editTarget?.id}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Action Title</Label>
                            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Assignee</Label>
                                <Input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Due Date</Label>
                                <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Priority</Label>
                                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Status</Label>
                                <Select value={editTarget?.status} onValueChange={v => setEditTarget((p: any) => ({ ...p, status: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes</Label>
                            <Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
