'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, ExternalLink, Clock, RefreshCw, DollarSign } from 'lucide-react';

const API = '/api/plugins/cm-learning';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';
const EMP_API = '/api/plugins/cm-employee-profiles';
const LEVELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export default function LearningWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><LearningPage /></DashboardLayout>;
}

function LearningPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [form, setForm] = useState({ id: '', title: '', provider: '', durationHours: 8, difficulty: 'Intermediate', format: 'Video', url: '', linkedCompetencies: [] as string[], targetLevel: 3, cost: 0, active: true });
    const [assignForm, setAssignForm] = useState({ employeeId: '', courseId: '', targetLevel: 3 });

    const fetchAll = useCallback(async () => {
        const [c, s, e, p] = await Promise.all([
            fetch(API + '?module=courses').then(r => r.json()),
            fetch(SKILL_API + '?module=competencies').then(r => r.json()),
            fetch(EMP_API + '?module=employees').then(r => r.json()),
            fetch(API + '?module=plans').then(r => r.json()),
        ]);
        if (c.data) setCourses(c.data);
        if (s.data) setCompetencies(s.data);
        if (e.data) setEmployees(e.data);
        if (p.data) setPlans(p.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const saveCourse = async () => {
        await fetch(API + '?module=courses', { method: 'POST', body: JSON.stringify({ ...form, id: form.id || `CRS-${Date.now().toString().slice(-4)}` }) });
        setDialogOpen(false); fetchAll();
    };
    const assign = async () => {
        const course = courses.find(c => c.id === assignForm.courseId);
        await fetch(API + '?module=plans', { method: 'POST', body: JSON.stringify({ id: `PLN-${Date.now().toString().slice(-5)}`, ...assignForm, courseTitle: course?.title, status: 'assigned', assignedAt: new Date() }) });
        setAssignOpen(false); fetchAll();
    };
    const getCompNames = (ids: string[]) => ids.map(id => competencies.find(c => c.id === id)?.name || id).join(', ');
    const diffColor = (d: string) => d === 'Beginner' ? 'bg-emerald-50 text-emerald-700' : d === 'Intermediate' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700';

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Learning & Development</h1><p className="text-sm text-muted-foreground">{courses.length} courses · {plans.length} assigned plans</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAssignOpen(true)}>Assign Training</Button>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6 grid lg:grid-cols-3 gap-6">
                {/* Course list */}
                <div className="lg:col-span-2">
                    <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">Course Library</h2>
                    <div className="grid gap-3">
                        {courses.map(c => (
                            <Card key={c.id} className="shadow-none">
                                <CardContent className="p-4 flex gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="font-semibold text-sm">{c.title}</p>
                                            {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></a>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{c.provider} · {c.format}</p>
                                        <div className="flex flex-wrap gap-1">
                                            <Badge variant="outline" className={`text-[10px] ${diffColor(c.difficulty)}`}>{c.difficulty}</Badge>
                                            <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" />{c.durationHours}h</Badge>
                                            {c.cost > 0 ? <Badge variant="outline" className="text-[10px]"><DollarSign className="h-2.5 w-2.5 mr-0.5" />{c.cost}</Badge> : <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600">Free</Badge>}
                                            <Badge variant="outline" className="text-[10px]">→ L{c.targetLevel} {LEVELS[c.targetLevel]}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                {/* Assigned plans */}
                <div>
                    <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">Dev Plans</h2>
                    <div className="space-y-2">
                        {plans.length === 0 && <p className="text-sm text-muted-foreground text-center py-6 border rounded-xl bg-white dark:bg-slate-900/30">No plans assigned yet.</p>}
                        {plans.map(p => (
                            <div key={p.id} className="bg-white dark:bg-slate-900/30 rounded-lg p-3 border">
                                <p className="font-medium text-sm">{employees.find(e => e.id === p.employeeId)?.name || p.employeeId}</p>
                                <p className="text-xs text-muted-foreground">{p.courseTitle}</p>
                                <Badge className="mt-1 text-[10px]">{p.status}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Add Course Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Course</DialogTitle><DialogDescription>Register a course in the learning library and link it to competencies.</DialogDescription></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5"><Label>Course Title <span className="text-red-500">*</span></Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. AWS Solutions Architect Prep" /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>Provider</Label><Input value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} placeholder="Coursera, Udemy…" /></div>
                            <div className="space-y-1.5"><Label>URL</Label><Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5"><Label>Duration (hrs)</Label><Input type="number" value={form.durationHours} onChange={e => setForm({ ...form, durationHours: +e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Difficulty</Label>
                                <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{['Beginner', 'Intermediate', 'Advanced'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5"><Label>Target Level</Label>
                                <Select value={String(form.targetLevel)} onValueChange={v => setForm({ ...form, targetLevel: +v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{[1, 2, 3, 4, 5].map(l => <SelectItem key={l} value={String(l)}>L{l}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveCourse} disabled={!form.title} className="bg-blue-600 hover:bg-blue-700">Add Course</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Assign Training Dialog */}
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Assign Training</DialogTitle><DialogDescription>Assign a course to an employee as a development plan item.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5"><Label>Employee</Label>
                            <Select value={assignForm.employeeId} onValueChange={v => setAssignForm({ ...assignForm, employeeId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Course</Label>
                            <Select value={assignForm.courseId} onValueChange={v => setAssignForm({ ...assignForm, courseId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
                        <Button onClick={assign} disabled={!assignForm.employeeId || !assignForm.courseId}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
