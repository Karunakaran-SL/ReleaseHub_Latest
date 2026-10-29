'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Network, Plus, Search, Users, Map as MapIcon, Pencil, Trash, UserPlus, Link as LinkIcon, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function TeamsManagerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex flex-col h-[calc(100vh-4rem)]">
                <TeamsManager />
            </div>
        </DashboardLayout>
    );
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Member { name: string; role: string; email: string; }
interface Team { id: string; product: string; members: Member[]; dependencies: string[]; }

// ─── Main Component ───────────────────────────────────────────────────────────
function TeamsManager() {
    const [view, setView] = useState<'list' | 'graph'>('list');
    const [teams, setTeams] = useState<Team[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([
        'Product Manager', 'Architect', 'System Engineer', 'QA Engineer', 'UX Designer', 'Delivery Manager'
    ]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // ── Dialogs state ─────────────────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [editMemberOpen, setEditMemberOpen] = useState(false);
    const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);

    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [memberToEdit, setMemberToEdit] = useState<{ member: Member; idx: number } | null>(null);

    // ── New team form ─────────────────────────────────────────────────────────
    const [newTeam, setNewTeam] = useState<{ id: string; productId: string; dependencies: string[] }>({
        id: '', productId: '', dependencies: []
    });
    const [newMembers, setNewMembers] = useState<Member[]>([{ name: '', role: '', email: '' }]);

    // ── Add/edit member form ──────────────────────────────────────────────────
    const [memberForm, setMemberForm] = useState<Member>({ name: '', role: '', email: '' });

    // ─── Data fetching ─── each call is independent so one failure won't block others
    const fetchAll = async () => {
        setLoading(true);
        // Teams
        try {
            const r = await fetch('/api/plugins/3iab-product-management?module=teams');
            const res = await r.json();
            if (res.data) setTeams(res.data);
        } catch { }
        // Products from existing backend API
        try {
            const r = await fetch('/api/products');
            const res = await r.json();
            if (Array.isArray(res)) setProducts(res);
            else if (Array.isArray(res?.data)) setProducts(res.data);
        } catch { }
        // Settings / custom roles
        try {
            const r = await fetch('/api/plugins/3iab-product-management?module=settings');
            const res = await r.json();
            if (Array.isArray(res.data?.roles) && res.data.roles.length > 0) {
                setAvailableRoles(res.data.roles);
            }
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    // ─── Helpers ── strip MongoDB _id before sending to avoid $set _id errors
    const strip = (obj: any) => {
        const { _id, ...rest } = obj;
        return rest;
    };
    const save = async (payload: any) => {
        await fetch('/api/plugins/3iab-product-management?module=teams', {
            method: 'POST',
            body: JSON.stringify(strip(payload))
        });
        fetchAll();
    };

    // ─── Create team ──────────────────────────────────────────────────────────
    const submitCreate = async () => {
        if (!newTeam.id || !newTeam.productId) return;
        const product = products.find(p => p._id === newTeam.productId || p.name === newTeam.productId);
        await save({
            id: newTeam.id.toUpperCase(),
            product: product?.name || newTeam.productId,
            members: newMembers.filter(m => m.name && m.role),
            dependencies: newTeam.dependencies
        });
        setCreateOpen(false);
        setNewTeam({ id: '', productId: '', dependencies: [] });
        setNewMembers([{ name: '', role: '', email: '' }]);
    };

    // ─── Delete team ──────────────────────────────────────────────────────────
    const confirmDeleteTeam = async () => {
        if (!selectedTeam) return;
        await save({ id: selectedTeam.id, actionType: 'DELETE' });
        setDeleteTeamOpen(false);
        setSelectedTeam(null);
    };

    // ─── Add member to existing team ──────────────────────────────────────────
    const submitAddMember = async () => {
        if (!selectedTeam || !memberForm.name || !memberForm.role) return;
        const updated = { ...selectedTeam, members: [...selectedTeam.members, { ...memberForm }] };
        await save(updated);
        setAddMemberOpen(false);
        setMemberForm({ name: '', role: '', email: '' });
    };

    // ─── Edit member ──────────────────────────────────────────────────────────
    const submitEditMember = async () => {
        if (!selectedTeam || !memberToEdit) return;
        const updatedMembers = [...selectedTeam.members];
        updatedMembers[memberToEdit.idx] = { ...memberForm };
        await save({ ...selectedTeam, members: updatedMembers });
        setEditMemberOpen(false);
        setMemberToEdit(null);
    };

    // ─── Delete member ────────────────────────────────────────────────────────
    const deleteMember = async (team: Team, idx: number) => {
        const updatedMembers = team.members.filter((_, i) => i !== idx);
        await save({ ...team, members: updatedMembers });
    };

    const filtered = teams.filter(t =>
        t.product.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.members.some(m => m.name.toLowerCase().includes(search.toLowerCase()))
    );

    const toggleDep = (id: string) => {
        setNewTeam(prev => ({
            ...prev,
            dependencies: prev.dependencies.includes(id)
                ? prev.dependencies.filter(x => x !== id)
                : [...prev.dependencies, id]
        }));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-background">
            {/* Header */}
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-lg border border-indigo-200">
                        <Network className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">3iaB Teams Registry</h1>
                        <p className="text-sm text-muted-foreground">Manage Product '3 in a box' configurations and dependencies</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'graph')} className="w-[180px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list"><Users className="h-4 w-4 mr-2" />List</TabsTrigger>
                            <TabsTrigger value="graph"><MapIcon className="h-4 w-4 mr-2" />Graph</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> New 3iaB Team
                    </Button>
                </div>
            </div>

            {/* ── List View ─────────────────────────────────────────────────────── */}
            {view === 'list' && (
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teams or members..."
                                className="w-80 pl-9"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && <div className="col-span-3 text-center p-8 text-muted-foreground">Loading teams...</div>}
                        {!loading && filtered.length === 0 && (
                            <div className="col-span-3 text-center p-12 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                                <p className="text-muted-foreground font-medium">No 3iab teams found.</p>
                                <p className="text-sm text-muted-foreground mt-1">Click "New 3iaB Team" to get started.</p>
                            </div>
                        )}
                        {!loading && filtered.map(team => (
                            <Card key={team.id} className="group hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                <CardContent className="p-5">
                                    {/* Team header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">{team.id}</Badge>
                                                {team.dependencies.length > 0 && (
                                                    <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">
                                                        <LinkIcon className="h-3 w-3 mr-1" />{team.dependencies.length} Deps
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-bold">{team.product}</h3>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7"
                                                title="Delete Team"
                                                onClick={() => { setSelectedTeam(team); setDeleteTeamOpen(true); }}>
                                                <Trash className="h-3.5 w-3.5 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Members list */}
                                    <div className="space-y-2">
                                        {team.members.map((m, idx) => (
                                            <div key={idx} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border group/member">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                                        {m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none">{m.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{m.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"
                                                        onClick={() => {
                                                            setSelectedTeam(team);
                                                            setMemberToEdit({ member: m, idx });
                                                            setMemberForm({ ...m });
                                                            setEditMemberOpen(true);
                                                        }}>
                                                        <Pencil className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"
                                                        onClick={() => deleteMember(team, idx)}>
                                                        <X className="h-3 w-3 text-red-400" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add member button */}
                                    <Button variant="ghost" className="w-full mt-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 text-sm"
                                        onClick={() => { setSelectedTeam(team); setMemberForm({ name: '', role: '', email: '' }); setAddMemberOpen(true); }}>
                                        <UserPlus className="h-3.5 w-3.5 mr-2" /> Add Member
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Graph View ────────────────────────────────────────────────────── */}
            {view === 'graph' && (
                <div className="flex-1 overflow-auto p-8">
                    <div className="text-center text-muted-foreground">
                        <p className="text-sm mb-6">Team dependency graph (based on shared members & explicit links)</p>
                        <div className="flex flex-wrap gap-6 justify-center">
                            {teams.map(team => (
                                <div key={team.id} className="bg-white dark:bg-slate-900 border-2 border-indigo-300 rounded-xl p-4 w-56 text-left shadow-sm">
                                    <div className="text-xs font-mono text-muted-foreground mb-1">{team.id}</div>
                                    <div className="font-bold text-sm mb-2">{team.product}</div>
                                    <div className="flex flex-wrap gap-1">
                                        {team.members.map((m, i) => (
                                            <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-100">{m.name.split(' ')[0]}</span>
                                        ))}
                                    </div>
                                    {team.dependencies.length > 0 && (
                                        <div className="mt-2 text-[10px] text-amber-600">🔗 deps: {team.dependencies.join(', ')}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/*  DIALOGS                                                            */}
            {/* ═══════════════════════════════════════════════════════════════════ */}

            {/* CREATE TEAM */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Configure New 3iaB Team</DialogTitle>
                        <DialogDescription>Select a product from your portfolio, assign members and define dependencies.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Team ID <span className="text-red-500">*</span></Label>
                                <Input placeholder="e.g. 3IAB-04" value={newTeam.id} onChange={e => setNewTeam({ ...newTeam, id: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Product <span className="text-red-500">*</span></Label>
                                <Select value={newTeam.productId} onValueChange={v => setNewTeam({ ...newTeam, productId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select a product…" /></SelectTrigger>
                                    <SelectContent>
                                        {products.length === 0 && <SelectItem value="__none" disabled>No products found</SelectItem>}
                                        {products.map(p => (
                                            <SelectItem key={p._id || p.name} value={p._id || p.name}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="space-y-2 border-t pt-4">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Team Members</Label>
                            {newMembers.map((m, i) => (
                                <div key={i} className="grid grid-cols-3 gap-2 items-start">
                                    <Input placeholder="Full name" value={m.name} onChange={e => setNewMembers(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                                    <Select value={m.role} onValueChange={v => setNewMembers(prev => prev.map((x, j) => j === i ? { ...x, role: v } : x))}>
                                        <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-1">
                                        <Input placeholder="Email" value={m.email} onChange={e => setNewMembers(prev => prev.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                                        {newMembers.length > 1 && (
                                            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setNewMembers(prev => prev.filter((_, j) => j !== i))}>
                                                <X className="h-4 w-4 text-red-400" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => setNewMembers(prev => [...prev, { name: '', role: '', email: '' }])}>
                                <Plus className="h-3.5 w-3.5 mr-2" /> Add Another Member
                            </Button>
                        </div>

                        {/* Dependencies */}
                        {teams.length > 0 && (
                            <div className="space-y-2 border-t pt-4">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Team Dependencies (optional)</Label>
                                <p className="text-xs text-muted-foreground">Select other teams this team depends on (shared members, explicit role connections, etc.)</p>
                                <div className="flex flex-wrap gap-2">
                                    {teams.map(t => (
                                        <div key={t.id} className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                                            onClick={() => toggleDep(t.id)}>
                                            <Checkbox checked={newTeam.dependencies.includes(t.id)} onCheckedChange={() => toggleDep(t.id)} />
                                            <div>
                                                <p className="text-xs font-mono font-bold">{t.id}</p>
                                                <p className="text-xs text-muted-foreground">{t.product}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={submitCreate} disabled={!newTeam.id || !newTeam.productId}>
                            Create Team
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ADD MEMBER */}
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Member to {selectedTeam?.id}</DialogTitle>
                        <DialogDescription>{selectedTeam?.product}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input placeholder="e.g. Sarah Jenkins" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Role <span className="text-red-500">*</span></Label>
                            <Select value={memberForm.role} onValueChange={v => setMemberForm({ ...memberForm, role: v })}>
                                <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email</Label>
                            <Input placeholder="e.g. s.jenkins@corp.com" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={submitAddMember} disabled={!memberForm.name || !memberForm.role}>
                            Add Member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT MEMBER */}
            <Dialog open={editMemberOpen} onOpenChange={setEditMemberOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Member</DialogTitle>
                        <DialogDescription>Update details for this member in {selectedTeam?.id}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Full Name</Label>
                            <Input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Role</Label>
                            <Select value={memberForm.role} onValueChange={v => setMemberForm({ ...memberForm, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email</Label>
                            <Input value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditMemberOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={submitEditMember}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE TEAM */}
            <Dialog open={deleteTeamOpen} onOpenChange={setDeleteTeamOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Team {selectedTeam?.id}?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the team <strong>{selectedTeam?.product}</strong> and all its member configurations. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTeamOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteTeam}>Delete Team</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
