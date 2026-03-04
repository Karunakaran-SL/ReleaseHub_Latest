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
import { MessageSquare, HeartHandshake, Plus, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = '/api/plugins/cm-communities';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';
const EMP_API = '/api/plugins/cm-employee-profiles';

export default function CommunitiesWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><CommunitiesPage /></DashboardLayout>;
}

function CommunitiesPage() {
    const [forums, setForums] = useState<any[]>([]);
    const [mentorships, setMentorships] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [tab, setTab] = useState('forums');
    const [forumDialog, setForumDialog] = useState(false);
    const [mentorDialog, setMentorDialog] = useState(false);
    const [fForm, setFForm] = useState({ id: '', title: '', linkedCompetencyId: '', tags: '' });
    const [mForm, setMForm] = useState({ id: '', mentorId: '', menteeId: '', competencyId: '', goals: '' });

    const fetchAll = useCallback(async () => {
        const [f, m, e, c] = await Promise.all([
            fetch(`${API}?module=forums`).then(r => r.json()),
            fetch(`${API}?module=mentorship`).then(r => r.json()),
            fetch(`${EMP_API}?module=employees`).then(r => r.json()),
            fetch(`${SKILL_API}?module=competencies`).then(r => r.json()),
        ]);
        if (f.data) setForums(f.data);
        if (m.data) setMentorships(m.data);
        if (e.data) setEmployees(e.data);
        if (c.data) setCompetencies(c.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const getName = (id: string) => employees.find(e => e.id === id)?.name || id;
    const getSkill = (id: string) => competencies.find(c => c.id === id)?.name || id;

    const saveForum = async () => {
        const me = employees[0];
        await fetch(`${API}?module=forums`, { method: 'POST', body: JSON.stringify({ ...fForm, id: fForm.id || `FOR-${Date.now().toString().slice(-4)}`, tags: fForm.tags.split(',').map(t => t.trim()).filter(Boolean), author: me?.id, authorName: me?.name, posts: 0 }) });
        setForumDialog(false); fetchAll();
    };
    const saveMentor = async () => {
        const mentor = employees.find(e => e.id === mForm.mentorId);
        const mentee = employees.find(e => e.id === mForm.menteeId);
        await fetch(`${API}?module=mentorship`, { method: 'POST', body: JSON.stringify({ ...mForm, id: mForm.id || `MNT-${Date.now().toString().slice(-4)}`, mentorName: mentor?.name, menteeName: mentee?.name, status: 'active', startDate: new Date().toISOString().split('T')[0] }) });
        setMentorDialog(false); fetchAll();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-pink-100 text-pink-700 rounded-lg flex items-center justify-center"><MessageSquare className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Communities</h1><p className="text-sm text-muted-foreground">{forums.length} forums · {mentorships.length} mentor pairs</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    {tab === 'forums' ? <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => setForumDialog(true)}><Plus className="h-4 w-4 mr-2" />Start Forum</Button>
                        : <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => setMentorDialog(true)}><Plus className="h-4 w-4 mr-2" />Match Mentor</Button>}
                </div>
            </div>
            <div className="p-4 pb-0"><Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="forums">Skill Forums</TabsTrigger><TabsTrigger value="mentorship">Mentorship</TabsTrigger></TabsList></Tabs></div>
            <div className="flex-1 overflow-auto p-6 pt-4 grid gap-3 content-start">
                {tab === 'forums' && forums.map(f => (
                    <Card key={f.id} className="shadow-none"><CardContent className="py-3 px-4 flex items-center gap-4">
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{f.title}</p>
                            <div className="flex gap-2 mt-1">
                                {f.linkedCompetencyId && <Badge variant="outline" className="text-[10px]">{getSkill(f.linkedCompetencyId)}</Badge>}
                                {(f.tags || []).map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground"><p>{f.posts} posts</p><p>by {f.authorName}</p></div>
                    </CardContent></Card>
                ))}
                {tab === 'mentorship' && mentorships.map(m => (
                    <Card key={m.id} className="shadow-none"><CardContent className="py-3 px-4 flex items-center gap-4">
                        <HeartHandshake className="h-8 w-8 text-pink-400 shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{m.mentorName} → {m.menteeName}</p>
                            <p className="text-xs text-muted-foreground">{getSkill(m.competencyId)} · {m.goals}</p>
                        </div>
                        <Badge className={m.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50'}>{m.status}</Badge>
                    </CardContent></Card>
                ))}
            </div>
            <Dialog open={forumDialog} onOpenChange={setForumDialog}>
                <DialogContent><DialogHeader><DialogTitle>Start Forum</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5"><Label>Title <span className="text-red-500">*</span></Label><Input value={fForm.title} onChange={e => setFForm({ ...fForm, title: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>Linked Skill</Label>
                            <Select value={fForm.linkedCompetencyId} onValueChange={v => setFForm({ ...fForm, linkedCompetencyId: v })}>
                                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                                <SelectContent>{competencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Tags</Label><Input value={fForm.tags} onChange={e => setFForm({ ...fForm, tags: e.target.value })} placeholder="architecture, design" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setForumDialog(false)}>Cancel</Button><Button onClick={saveForum} disabled={!fForm.title} className="bg-pink-600 hover:bg-pink-700">Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={mentorDialog} onOpenChange={setMentorDialog}>
                <DialogContent><DialogHeader><DialogTitle>Create Mentor Match</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>Mentor</Label>
                                <Select value={mForm.mentorId} onValueChange={v => setMForm({ ...mForm, mentorId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5"><Label>Mentee</Label>
                                <Select value={mForm.menteeId} onValueChange={v => setMForm({ ...mForm, menteeId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>{employees.filter(e => e.id !== mForm.mentorId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5"><Label>Focus Skill</Label>
                            <Select value={mForm.competencyId} onValueChange={v => setMForm({ ...mForm, competencyId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>{competencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Goals</Label><Input value={mForm.goals} onChange={e => setMForm({ ...mForm, goals: e.target.value })} placeholder="e.g. Get CKA certified in 3 months" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setMentorDialog(false)}>Cancel</Button><Button onClick={saveMentor} disabled={!mForm.mentorId || !mForm.menteeId} className="bg-pink-600 hover:bg-pink-700">Create Match</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
