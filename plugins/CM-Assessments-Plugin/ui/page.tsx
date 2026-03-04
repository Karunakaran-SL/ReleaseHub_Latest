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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, CheckCircle, Clock, Plus, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = '/api/plugins/cm-assessments';
const EMP_API = '/api/plugins/cm-employee-profiles';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';
const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export default function AssessmentsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><AssessmentsPage /></DashboardLayout>;
}

function AssessmentsPage() {
    const [assessments, setAssessments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [tab, setTab] = useState('pending');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialog, setEditDialog] = useState<any>(null);
    const [form, setForm] = useState({ employeeId: '', competencyId: '', type: 'self', assessedLevel: 3, comments: '' });

    const fetchAll = useCallback(async () => {
        const [a, e, c] = await Promise.all([
            fetch(API).then(r => r.json()),
            fetch(`${EMP_API}?module=employees`).then(r => r.json()),
            fetch(`${SKILL_API}?module=competencies`).then(r => r.json()),
        ]);
        if (a.data) setAssessments(a.data);
        if (e.data) setEmployees(e.data);
        if (c.data) setCompetencies(c.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const getName = (id: string, list: any[], key = 'name', matchKey = 'id') => list.find(i => i[matchKey] === id)?.[key] || id;
    const filtered = assessments.filter(a => tab === 'pending' ? a.status === 'pending' : a.status === 'completed');
    const pending = assessments.filter(a => a.status === 'pending').length;

    const create = async () => {
        const id = `ASS-${Date.now().toString().slice(-5)}`;
        await fetch(API, { method: 'POST', body: JSON.stringify({ id, ...form, date: new Date(), status: 'pending' }) });
        setDialogOpen(false);
        setForm({ employeeId: '', competencyId: '', type: 'self', assessedLevel: 3, comments: '' });
        fetchAll();
    };

    const complete = async (a: any, level: number, comments: string) => {
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...a, assessedLevel: level, comments, status: 'completed', date: new Date() }) });
        setEditDialog(null);
        fetchAll();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center"><ClipboardList className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Skills Assessments</h1><p className="text-sm text-muted-foreground">{pending} pending review</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Assessment</Button>
                </div>
            </div>
            <div className="p-4 pb-0">
                <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="pending">Pending ({pending})</TabsTrigger><TabsTrigger value="completed">Completed</TabsTrigger></TabsList></Tabs>
            </div>
            <div className="flex-1 overflow-auto p-6 pt-4 grid gap-3 content-start">
                {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground border rounded-xl bg-white dark:bg-slate-900/30">No {tab} assessments.</div>}
                {filtered.map(a => (
                    <Card key={a.id} className="shadow-none">
                        <CardContent className="py-3 px-4 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="font-medium text-sm">{getName(a.employeeId, employees)}</p>
                                    <span className="text-muted-foreground">·</span>
                                    <p className="text-sm">{getName(a.competencyId, competencies)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-[10px]">{a.type === 'self' ? 'Self' : a.type === 'manager' ? 'Manager' : 'Peer'}</Badge>
                                    {a.assessedLevel && <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Level {a.assessedLevel} – {LEVELS[a.assessedLevel - 1]}</Badge>}
                                    <span className="text-xs text-muted-foreground">{a.date ? new Date(a.date).toLocaleDateString() : ''}</span>
                                </div>
                                {a.comments && <p className="text-xs text-muted-foreground mt-1 italic">"{a.comments}"</p>}
                            </div>
                            {a.status === 'pending' && <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-7 text-xs" onClick={() => setEditDialog({ ...a, level: 3, note: '' })}>Complete Review</Button>}
                            {a.status === 'completed' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Assessment</DialogTitle><DialogDescription>Schedule a self, manager, or peer assessment for an employee.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5"><Label>Employee</Label>
                            <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select employee…" /></SelectTrigger>
                                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Competency</Label>
                            <Select value={form.competencyId} onValueChange={v => setForm({ ...form, competencyId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select skill…" /></SelectTrigger>
                                <SelectContent>{competencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Assessment Type</Label>
                            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="self">Self Assessment</SelectItem><SelectItem value="manager">Manager Review</SelectItem><SelectItem value="peer">Peer Review</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={create} disabled={!form.employeeId || !form.competencyId} className="bg-orange-600 hover:bg-orange-700">Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Complete Assessment Dialog */}
            {editDialog && (
                <Dialog open onOpenChange={() => setEditDialog(null)}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Complete Assessment</DialogTitle><DialogDescription>Set the assessed level for {getName(editDialog.employeeId, employees)} — {getName(editDialog.competencyId, competencies)}.</DialogDescription></DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5"><Label>Assessed Level</Label>
                                <Select value={String(editDialog.level)} onValueChange={v => setEditDialog({ ...editDialog, level: parseInt(v) })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{[1, 2, 3, 4, 5].map(l => <SelectItem key={l} value={String(l)}>Level {l} – {LEVELS[l - 1]}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5"><Label>Comments</Label><Textarea rows={3} value={editDialog.note} onChange={e => setEditDialog({ ...editDialog, note: e.target.value })} placeholder="Observations and feedback…" /></div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
                            <Button onClick={() => complete(editDialog, editDialog.level, editDialog.note)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="h-4 w-4 mr-2" />Mark Complete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
