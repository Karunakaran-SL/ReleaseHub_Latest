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
import { TrendingUp, Plus, RefreshCw, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = '/api/plugins/cm-performance';
const EMP_API = '/api/plugins/cm-employee-profiles';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';

export default function PerformanceWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><PerformancePage /></DashboardLayout>;
}

function PerformancePage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [tab, setTab] = useState('reviews');
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ id: '', employeeId: '', performanceScore: 4.0, linkedCompetencies: [] as string[], year: new Date().getFullYear(), quarter: 'Q1', strengths: '', improvements: '' });
    const [fbForm, setFbForm] = useState({ id: '', employeeId: '', fromEmployeeId: '', competencyId: '', rating: 4, comment: '' });

    const fetchAll = useCallback(async () => {
        const [r, f, e] = await Promise.all([
            fetch(`${API}?module=reviews`).then(r => r.json()),
            fetch(`${API}?module=feedback`).then(r => r.json()),
            fetch(`${EMP_API}?module=employees`).then(r => r.json()),
        ]);
        if (r.data) setReviews(r.data);
        if (f.data) setFeedback(f.data);
        if (e.data) setEmployees(e.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const getName = (id: string) => employees.find(e => e.id === id)?.name || id;
    const scoreColor = (s: number) => s >= 4.5 ? 'text-emerald-600' : s >= 3.5 ? 'text-blue-600' : 'text-orange-500';

    const save = async () => {
        await fetch(`${API}?module=reviews`, { method: 'POST', body: JSON.stringify({ ...form, id: form.id || `PERF-${Date.now().toString().slice(-4)}` }) });
        setDialog(false); fetchAll();
    };
    const saveFb = async () => {
        await fetch(`${API}?module=feedback`, { method: 'POST', body: JSON.stringify({ ...fbForm, id: `FB-${Date.now().toString().slice(-4)}`, year: new Date().getFullYear() }) });
        setFeedback([]); fetchAll();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Performance Integration</h1><p className="text-sm text-muted-foreground">Skill-linked reviews and 360° feedback</p></div>
                </div>
                <div className="flex gap-2"><Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button><Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setDialog(true)}><Plus className="h-4 w-4 mr-2" />{tab === 'reviews' ? 'New Review' : 'Add Feedback'}</Button></div>
            </div>
            <div className="p-4 pb-0"><Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="reviews">Performance Reviews</TabsTrigger><TabsTrigger value="feedback">360° Feedback</TabsTrigger></TabsList></Tabs></div>
            <div className="flex-1 overflow-auto p-6 pt-4 grid gap-3 content-start">
                {tab === 'reviews' && reviews.map(r => (
                    <Card key={r.id} className="shadow-none"><CardContent className="py-3 px-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5"><p className="font-semibold text-sm">{getName(r.employeeId)}</p><Badge variant="outline" className="text-[10px]">{r.quarter} {r.year}</Badge></div>
                            <p className="text-xs text-muted-foreground">{r.strengths && <><span className="text-emerald-600">✓</span> {r.strengths} · </>}{r.improvements && <><span className="text-orange-500">△</span> {r.improvements}</>}</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-2xl font-bold ${scoreColor(r.performanceScore)}`}>{r.performanceScore}</p>
                            <p className="text-[10px] text-muted-foreground">/5.0</p>
                        </div>
                    </CardContent></Card>
                ))}
                {tab === 'feedback' && feedback.map(f => (
                    <Card key={f.id} className="shadow-none"><CardContent className="py-3 px-4 flex items-center gap-4">
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{getName(f.employeeId)}</p>
                            <p className="text-xs text-muted-foreground italic">from {getName(f.fromEmployeeId)} · "{f.comment}"</p>
                        </div>
                        <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-4 w-4 ${s <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />)}</div>
                    </CardContent></Card>
                ))}
            </div>
            <Dialog open={dialog} onOpenChange={setDialog}>
                <DialogContent><DialogHeader><DialogTitle>{tab === 'reviews' ? 'New Performance Review' : 'Add 360° Feedback'}</DialogTitle></DialogHeader>
                    {tab === 'reviews' ? (
                        <div className="space-y-3 py-2">
                            <div className="space-y-1.5"><Label>Employee</Label>
                                <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5"><Label>Score</Label><Input type="number" min={1} max={5} step={0.1} value={form.performanceScore} onChange={e => setForm({ ...form, performanceScore: +e.target.value })} /></div>
                                <div className="space-y-1.5"><Label>Quarter</Label>
                                    <Select value={form.quarter} onValueChange={v => setForm({ ...form, quarter: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{['Q1', 'Q2', 'Q3', 'Q4'].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5"><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })} /></div>
                            </div>
                            <div className="space-y-1.5"><Label>Strengths</Label><Input value={form.strengths} onChange={e => setForm({ ...form, strengths: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Improvements</Label><Input value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })} /></div>
                            <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={save} disabled={!form.employeeId} className="bg-blue-600 hover:bg-blue-700">Save</Button></DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><Label>About</Label>
                                    <Select value={fbForm.employeeId} onValueChange={v => setFbForm({ ...fbForm, employeeId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Employee…" /></SelectTrigger>
                                        <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5"><Label>From</Label>
                                    <Select value={fbForm.fromEmployeeId} onValueChange={v => setFbForm({ ...fbForm, fromEmployeeId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Employee…" /></SelectTrigger>
                                        <SelectContent>{employees.filter(e => e.id !== fbForm.employeeId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={fbForm.rating} onChange={e => setFbForm({ ...fbForm, rating: +e.target.value })} /></div>
                            </div>
                            <div className="space-y-1.5"><Label>Comment</Label><Textarea rows={2} value={fbForm.comment} onChange={e => setFbForm({ ...fbForm, comment: e.target.value })} /></div>
                            <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={saveFb} disabled={!fbForm.employeeId || !fbForm.fromEmployeeId} className="bg-blue-600 hover:bg-blue-700">Submit</Button></DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
