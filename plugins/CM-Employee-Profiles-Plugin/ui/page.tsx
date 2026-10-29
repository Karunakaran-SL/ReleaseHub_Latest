'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Plus, Pencil, CheckCircle, Clock, Search, ThumbsUp, Shield } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EMP_API = '/api/plugins/cm-employee-profiles';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';
const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export default function EmployeeProfilesWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><EmployeeProfiles user={user} /></DashboardLayout>;
}

function EmployeeProfiles({ user }: { user: User | null }) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [selected, setSelected] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [addSkillOpen, setAddSkillOpen] = useState(false);
    const [skillForm, setSkillForm] = useState({ competencyId: '', selfAssessedLevel: 3 });

    const fetchAll = useCallback(async () => {
        const [e, s, c, st] = await Promise.all([
            fetch(`${EMP_API}?module=employees`).then(r => r.json()),
            fetch(`${EMP_API}?module=skills`).then(r => r.json()),
            fetch(`${SKILL_API}?module=competencies`).then(r => r.json()),
            fetch(`${EMP_API}?module=stats`).then(r => r.json()),
        ]);
        if (e.data) setEmployees(e.data);
        if (s.data) setSkills(s.data);
        if (c.data) setCompetencies(c.data);
        if (st.data) setStats(st.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const empSkills = selected ? skills.filter(s => s.employeeId === selected.id) : [];
    const getCompName = (id: string) => competencies.find(c => c.id === id)?.name || id;

    const validate = async (skillId: string) => {
        await fetch(`${EMP_API}?module=skills`, { method: 'POST', body: JSON.stringify({ id: skillId, actionType: 'VALIDATE' }) });
        fetchAll();
    };
    const endorse = async (skillId: string) => {
        await fetch(`${EMP_API}?module=skills`, { method: 'POST', body: JSON.stringify({ id: skillId, actionType: 'ENDORSE' }) });
        fetchAll();
    };
    const addSkill = async () => {
        if (!selected || !skillForm.competencyId) return;
        const id = `ES-${Date.now().toString().slice(-5)}`;
        await fetch(`${EMP_API}?module=skills`, { method: 'POST', body: JSON.stringify({ id, employeeId: selected.id, ...skillForm, currentLevel: skillForm.selfAssessedLevel, managerValidated: false, endorsements: [] }) });
        setAddSkillOpen(false);
        setSkillForm({ competencyId: '', selfAssessedLevel: 3 });
        fetchAll();
    };
    const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    const filtered = employees.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            {/* Sidebar */}
            <div className="w-80 border-r bg-background flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center"><UserCheck className="h-4 w-4" /></div>
                        <h1 className="font-bold">Employee Profiles</h1>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {[{ l: 'Employees', v: stats.empCount }, { l: 'Skills', v: stats.skillAssignments }, { l: 'Pending', v: stats.pendingValidations }].map(s => (
                            <div key={s.l} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2"><p className="font-bold text-base">{s.v ?? '–'}</p><p className="text-muted-foreground">{s.l}</p></div>
                        ))}
                    </div>
                </div>
                <div className="p-3 border-b">
                    <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input className="pl-8 h-8 text-sm" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} /></div>
                </div>
                <div className="flex-1 overflow-auto">
                    {filtered.map(emp => (
                        <div key={emp.id} onClick={() => setSelected(emp)} className={`p-3 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 ${selected?.id === emp.id ? 'bg-emerald-50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-500' : ''}`}>
                            <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">{initials(emp.name)}</AvatarFallback></Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{emp.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{emp.department} · {skills.filter(s => s.employeeId === emp.id).length} skills</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Detail */}
            <div className="flex-1 overflow-auto p-6">
                {!selected ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <UserCheck className="h-12 w-12 mb-3 opacity-20" /><p>Select an employee to view their skill profile</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-14 w-14"><AvatarFallback className="text-lg bg-emerald-100 text-emerald-700">{initials(selected.name)}</AvatarFallback></Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{selected.name}</h2>
                                <p className="text-muted-foreground text-sm">{selected.email} · {selected.department} · {selected.location}</p>
                            </div>
                            <Button className="ml-auto bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddSkillOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Skill</Button>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Skill Profile ({empSkills.length} skills)</h3>
                            {empSkills.length === 0 && <div className="text-center py-8 border rounded-xl text-muted-foreground text-sm">No skills recorded yet. Click "Add Skill" to get started.</div>}
                            {empSkills.map(sk => (
                                <Card key={sk.id} className="shadow-none group">
                                    <CardContent className="py-3 px-4 flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm">{getCompName(sk.competencyId)}</p>
                                                {sk.managerValidated ? (
                                                    <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"><Shield className="h-2.5 w-2.5 mr-1" />Validated</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-1" />Pending</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{sk.endorsements?.length || 0} endorsements · Last reviewed: {sk.lastReviewed ? new Date(sk.lastReviewed).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(l => <div key={l} className={`h-6 w-2.5 rounded-sm ${l <= sk.currentLevel ? 'bg-emerald-500' : 'bg-slate-200'}`} title={LEVELS[l - 1]} />)}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                            {!sk.managerValidated && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => validate(sk.id)}><CheckCircle className="h-3 w-3 mr-1" />Validate</Button>}
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => endorse(sk.id)}><ThumbsUp className="h-3 w-3 mr-1" />Endorse</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
            {/* Add Skill Dialog */}
            <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Skill to {selected?.name}</DialogTitle><DialogDescription>Record a new competency with the current self-assessed proficiency level.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5"><Label>Competency <span className="text-red-500">*</span></Label>
                            <Select value={skillForm.competencyId} onValueChange={v => setSkillForm({ ...skillForm, competencyId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select a skill…" /></SelectTrigger>
                                <SelectContent>{competencies.filter(c => !empSkills.find(s => s.competencyId === c.id)).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Proficiency Level</Label>
                            <Select value={String(skillForm.selfAssessedLevel)} onValueChange={v => setSkillForm({ ...skillForm, selfAssessedLevel: parseInt(v) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{[1, 2, 3, 4, 5].map(l => <SelectItem key={l} value={String(l)}>Level {l} – {LEVELS[l - 1]}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddSkillOpen(false)}>Cancel</Button>
                        <Button onClick={addSkill} disabled={!skillForm.competencyId} className="bg-emerald-600 hover:bg-emerald-700">Add Skill</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
