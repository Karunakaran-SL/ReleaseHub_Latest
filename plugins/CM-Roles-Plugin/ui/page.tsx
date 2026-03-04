'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Pencil, Trash2, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const API = '/api/plugins/cm-roles';
const SKILLS_API = '/api/plugins/cm-skill-taxonomy';
const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Data', 'DevOps', 'Security', 'Marketing', 'Finance', 'HR'];

export default function RolesWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><RolesManager /></DashboardLayout>;
}

function RolesManager() {
    const [roles, setRoles] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const newDefault = { id: '', name: '', department: '', level: 'Mid', competencies: [] as any[] };
    const [form, setForm] = useState({ ...newDefault });

    const fetchAll = useCallback(async () => {
        const [r, c] = await Promise.all([fetch(API).then(r => r.json()), fetch(`${SKILLS_API}?module=competencies`).then(r => r.json())]);
        if (r.data) setRoles(r.data);
        if (c.data) setCompetencies(c.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const openCreate = () => { setEditing(null); setForm({ ...newDefault, id: `ROLE-${Date.now().toString().slice(-3)}` }); setDialogOpen(true); };
    const openEdit = (r: any) => { setEditing(r); setForm({ ...r }); setDialogOpen(true); };

    const toggleComp = (compId: string) => {
        const exists = form.competencies.find((c: any) => c.competencyId === compId);
        if (exists) setForm({ ...form, competencies: form.competencies.filter((c: any) => c.competencyId !== compId) });
        else setForm({ ...form, competencies: [...form.competencies, { competencyId: compId, requiredLevel: 3, mandatory: false, weight: 10 }] });
    };
    const updateComp = (compId: string, field: string, value: any) => {
        setForm({ ...form, competencies: form.competencies.map((c: any) => c.competencyId === compId ? { ...c, [field]: value } : c) });
    };

    const save = async () => {
        await fetch(API, { method: 'POST', body: JSON.stringify(form) });
        setDialogOpen(false); fetchAll();
    };

    const filtered = roles.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.department.toLowerCase().includes(search.toLowerCase()));
    const getCompName = (id: string) => competencies.find(c => c.id === id)?.name || id;

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            {/* Sidebar list */}
            <div className="w-80 border-r bg-background flex flex-col">
                <div className="p-4 border-b flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center"><Briefcase className="h-4 w-4" /></div>
                    <h1 className="font-bold">Role Library</h1>
                    <Button size="sm" className="ml-auto h-7 px-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}><Plus className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="p-3 border-b">
                    <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input className="pl-8 h-8 text-sm" placeholder="Search roles…" value={search} onChange={e => setSearch(e.target.value)} /></div>
                </div>
                <div className="flex-1 overflow-auto">
                    {filtered.map(role => (
                        <div key={role.id} onClick={() => setSelectedRole(role)} className={`p-3 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedRole?.id === role.id ? 'bg-blue-50 dark:bg-blue-950/30 border-l-2 border-l-blue-500' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{role.name}</span>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); openEdit(role); }}><Pencil className="h-3 w-3" /></Button>
                                </div>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                                <Badge variant="outline" className="text-[10px]">{role.department}</Badge>
                                <Badge variant="outline" className="text-[10px]">{role.level}</Badge>
                                <Badge className="text-[10px] bg-slate-100 text-slate-600 border-0">{role.competencies?.length || 0} skills</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Detail panel */}
            <div className="flex-1 overflow-auto p-6">
                {!selectedRole ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Briefcase className="h-12 w-12 mb-3 opacity-20" />
                        <p>Select a role to view skill requirements</p>
                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create First Role</Button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedRole.name}</h2>
                                <div className="flex gap-2 mt-1"><Badge>{selectedRole.department}</Badge><Badge variant="outline">{selectedRole.level}</Badge></div>
                            </div>
                            <Button variant="outline" onClick={() => openEdit(selectedRole)}><Pencil className="h-4 w-4 mr-2" />Edit Role</Button>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Required Competencies</h3>
                            {(selectedRole.competencies || []).map((c: any) => (
                                <Card key={c.competencyId} className="shadow-none">
                                    <CardContent className="py-3 px-4 flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{getCompName(c.competencyId)}</p>
                                            <p className="text-xs text-muted-foreground">Required: Level {c.requiredLevel} – {LEVELS[c.requiredLevel - 1]} • Weight: {c.weight}%</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {c.mandatory ? <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]"><AlertCircle className="h-2.5 w-2.5 mr-1" />Mandatory</Badge> : <Badge variant="outline" className="text-[10px]">Optional</Badge>}
                                        </div>
                                        {/* Visual level indicator */}
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(l => <div key={l} className={`h-5 w-2 rounded-sm ${l <= c.requiredLevel ? 'bg-blue-500' : 'bg-slate-200'}`} />)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Role' : 'Create Role'}</DialogTitle>
                        <DialogDescription>Define the role and map required competencies with proficiency levels.</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-auto flex-1 space-y-4 py-2 pr-1">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5"><Label>Role ID</Label><Input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} disabled={!!editing} /></div>
                            <div className="space-y-1.5"><Label>Department</Label>
                                <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5"><Label>Level</Label>
                                <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{['Junior', 'Mid', 'Senior', 'Principal', 'Head', 'Manager', 'Director', 'VP'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5"><Label>Role Name <span className="text-red-500">*</span></Label><Input placeholder="e.g. Senior Backend Engineer" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div className="space-y-2">
                            <Label>Competency Mapping</Label>
                            <div className="border rounded-lg divide-y max-h-64 overflow-auto">
                                {competencies.map(comp => {
                                    const mapped = form.competencies.find((c: any) => c.competencyId === comp.id);
                                    return (
                                        <div key={comp.id} className="p-2 flex items-center gap-3">
                                            <Checkbox checked={!!mapped} onCheckedChange={() => toggleComp(comp.id)} id={`comp-${comp.id}`} />
                                            <label htmlFor={`comp-${comp.id}`} className="flex-1 text-sm cursor-pointer">{comp.name}</label>
                                            {mapped && (
                                                <div className="flex gap-2">
                                                    <Select value={String(mapped.requiredLevel)} onValueChange={v => updateComp(comp.id, 'requiredLevel', parseInt(v))}>
                                                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent>{[1, 2, 3, 4, 5].map(l => <SelectItem key={l} value={String(l)}>L{l} – {LEVELS[l - 1]}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <div className="flex items-center gap-1"><Checkbox checked={mapped.mandatory} onCheckedChange={v => updateComp(comp.id, 'mandatory', !!v)} id={`mand-${comp.id}`} /><label htmlFor={`mand-${comp.id}`} className="text-xs">Mandatory</label></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={save} disabled={!form.name || !form.department} className="bg-blue-600 hover:bg-blue-700">{editing ? 'Save' : 'Create Role'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
