'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Library, Plus, Search, Pencil, Archive, Tag, BookOpen, Layers, Filter, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = '/api/plugins/cm-skill-taxonomy';
const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export default function SkillTaxonomyWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><SkillTaxonomy /></DashboardLayout>;
}

function SkillTaxonomy() {
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [tab, setTab] = useState('active');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [catDialogOpen, setCatDialogOpen] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', color: '#6366f1' });

    const newDefault = { id: '', name: '', categoryId: '', description: '', tags: '', sfia: '', esco: '' };
    const [form, setForm] = useState({ ...newDefault });

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const [comps, cats, st] = await Promise.all([
            fetch(`${API}?module=competencies`).then(r => r.json()),
            fetch(`${API}?module=categories`).then(r => r.json()),
            fetch(`${API}?module=stats`).then(r => r.json()),
        ]);
        if (comps.data) setCompetencies(comps.data);
        if (cats.data) setCategories(cats.data);
        if (st.data) setStats(st.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const openCreate = () => { setEditing(null); setForm({ ...newDefault, id: `COMP-${Date.now().toString().slice(-4)}` }); setDialogOpen(true); };
    const openEdit = (c: any) => { setEditing(c); setForm({ ...c, tags: (c.tags || []).join(', ') }); setDialogOpen(true); };

    const save = async () => {
        const payload = { ...form, tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) };
        await fetch(`${API}?module=competencies`, { method: 'POST', body: JSON.stringify(payload) });
        setDialogOpen(false);
        fetchAll();
    };

    const archive = async (c: any) => {
        if (!confirm(`Archive "${c.name}"? It will no longer appear in new assignments.`)) return;
        await fetch(`${API}?module=competencies`, { method: 'POST', body: JSON.stringify({ id: c.id, actionType: 'DELETE' }) });
        fetchAll();
    };

    const saveCat = async () => {
        const id = `CAT-${Date.now().toString().slice(-3)}`;
        await fetch(`${API}?module=categories`, { method: 'POST', body: JSON.stringify({ id, ...newCat }) });
        setNewCat({ name: '', color: '#6366f1' });
        setCatDialogOpen(false);
        fetchAll();
    };

    const getCatName = (id: string) => categories.find(c => c.id === id)?.name || id;
    const getCatColor = (id: string) => categories.find(c => c.id === id)?.color || '#64748b';

    const filtered = competencies.filter(c => {
        const matchTab = tab === 'active' ? c.status === 'active' : c.status === 'archived';
        const matchCat = filterCat === 'all' || c.categoryId === filterCat;
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
        return matchTab && matchCat && matchSearch;
    });

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            {/* Header */}
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center border border-violet-200">
                        <Library className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Skill Taxonomy</h1>
                        <p className="text-sm text-muted-foreground">Central master registry of all competencies</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCatDialogOpen(true)}><Layers className="h-4 w-4 mr-2" />Categories</Button>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Skill</Button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 p-6 pb-0">
                {[
                    { label: 'Total Skills', value: stats.total ?? '–', icon: BookOpen, color: 'text-violet-600' },
                    { label: 'Active', value: stats.active ?? '–', icon: Library, color: 'text-emerald-600' },
                    { label: 'Archived', value: stats.archived ?? '–', icon: Archive, color: 'text-slate-400' },
                    { label: 'Categories', value: stats.cats ?? '–', icon: Layers, color: 'text-blue-600' },
                ].map(s => (
                    <Card key={s.label} className="shadow-none">
                        <CardContent className="py-4 px-5 flex items-center gap-3">
                            <s.icon className={`h-8 w-8 ${s.color}`} />
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 px-6 py-4">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList><TabsTrigger value="active">Active</TabsTrigger><TabsTrigger value="archived">Archived</TabsTrigger></TabsList>
                </Tabs>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search skills or tags…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Filter className="h-4 w-4" /></div>
                <Select value={filterCat} onValueChange={setFilterCat}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All categories" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Skills grid */}
            <div className="flex-1 overflow-auto px-6 pb-6">
                {loading && <div className="text-center p-12 text-muted-foreground">Loading skill library…</div>}
                {!loading && filtered.length === 0 && (
                    <div className="text-center p-12 border rounded-xl bg-white dark:bg-slate-900/50">
                        <Library className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                        <p className="text-muted-foreground">No skills found. Click "New Skill" to add the first one.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(c => (
                        <Card key={c.id} className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="font-mono text-[10px]">{c.id}</Badge>
                                        <span className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: getCatColor(c.categoryId) }}>{getCatName(c.categoryId)}</span>
                                    </div>
                                    {tab === 'active' && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => archive(c)}><Archive className="h-3.5 w-3.5 text-red-400" /></Button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{c.name}</h3>
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{c.description}</p>
                                {/* Proficiency levels mini bar */}
                                <div className="flex gap-1 mb-3">
                                    {(c.levels || LEVELS.map((l, i) => ({ level: i + 1, label: l }))).map((lv: any) => (
                                        <div key={lv.level} className="flex-1 h-1.5 rounded-full bg-violet-200 dark:bg-violet-900/50" title={lv.label} />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {(c.tags || []).slice(0, 4).map((tag: string) => (
                                        <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-muted-foreground">
                                            <Tag className="h-2.5 w-2.5" />{tag}
                                        </span>
                                    ))}
                                </div>
                                {(c.sfia || c.esco) && (
                                    <div className="mt-2 pt-2 border-t flex gap-2 text-[10px] text-muted-foreground font-mono">
                                        {c.sfia && <span>SFIA: {c.sfia}</span>}
                                        {c.esco && <span>ESCO: {c.esco}</span>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* CREATE / EDIT Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Competency' : 'New Competency'}</DialogTitle>
                        <DialogDescription>Define a skill with proficiency scale, category, and external framework codes.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Skill ID</Label>
                                <Input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} disabled={!!editing} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Category <span className="text-red-500">*</span></Label>
                                <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Skill Name <span className="text-red-500">*</span></Label>
                            <Input placeholder="e.g. Python Programming" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea rows={2} placeholder="What does this skill involve?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>SFIA Code</Label>
                                <Input placeholder="e.g. PROG" value={form.sfia} onChange={e => setForm({ ...form, sfia: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>ESCO / O*NET</Label>
                                <Input placeholder="e.g. Python" value={form.esco} onChange={e => setForm({ ...form, esco: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Tags (comma-separated)</Label>
                            <Input placeholder="backend, scripting, automation" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button className="bg-violet-600 hover:bg-violet-700" onClick={save} disabled={!form.name || !form.categoryId}>
                            {editing ? 'Save Changes' : 'Create Skill'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CATEGORY Dialog */}
            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Category Name</Label>
                            <Input placeholder="e.g. Data Science" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Color</Label>
                            <div className="flex gap-2 items-center">
                                <input type="color" value={newCat.color} onChange={e => setNewCat({ ...newCat, color: e.target.value })} className="h-9 w-20 rounded border cursor-pointer" />
                                <span className="text-sm text-muted-foreground font-mono">{newCat.color}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveCat} disabled={!newCat.name}>Add Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
