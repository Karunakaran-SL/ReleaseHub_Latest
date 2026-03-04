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
import { Map, Plus, Flag, Clock, RefreshCw, ArrowRight } from 'lucide-react';

const API = '/api/plugins/cm-career';
const ROLES_API = '/api/plugins/cm-roles';

export default function CareerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><CareerPage /></DashboardLayout>;
}

function CareerPage() {
    const [paths, setPaths] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ id: '', fromRoleId: '', toRoleId: '', fromRole: '', toRole: '', estimatedMonths: 18, milestones: '' });

    const fetchAll = useCallback(async () => {
        const [p, r] = await Promise.all([fetch(API).then(r => r.json()), fetch(ROLES_API).then(r => r.json())]);
        if (p.data) setPaths(p.data);
        if (r.data) setRoles(r.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || id;

    const save = async () => {
        const fromRole = getRoleName(form.fromRoleId);
        const toRole = getRoleName(form.toRoleId);
        const milestones = form.milestones.split('\n').filter(Boolean);
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...form, id: form.id || `CP-${Date.now().toString().slice(-4)}`, fromRole, toRole, milestones }) });
        setDialogOpen(false);
        setForm({ id: '', fromRoleId: '', toRoleId: '', fromRole: '', toRole: '', estimatedMonths: 18, milestones: '' });
        fetchAll();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center"><Map className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Career Development</h1><p className="text-sm text-muted-foreground">{paths.length} career paths defined</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Path</Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6 grid md:grid-cols-2 gap-4 content-start">
                {paths.map(p => (
                    <Card key={p.id} className="shadow-none hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-xs">{p.fromRole}</Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Badge className="text-xs bg-teal-100 text-teal-700 border-teal-200">{p.toRole}</Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                                <Clock className="h-3.5 w-3.5" />{p.estimatedMonths} months estimated
                            </div>
                            {p.milestones?.length > 0 && (
                                <div className="space-y-1.5">
                                    {p.milestones.map((m: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                            <Flag className="h-3 w-3 text-teal-500 mt-0.5 shrink-0" />
                                            <span>{m}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Career Path</DialogTitle><DialogDescription>Define a role-to-role progression with milestones.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>From Role</Label>
                                <Select value={form.fromRoleId} onValueChange={v => setForm({ ...form, fromRoleId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5"><Label>To Role</Label>
                                <Select value={form.toRoleId} onValueChange={v => setForm({ ...form, toRoleId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5"><Label>Estimated Months</Label><Input type="number" value={form.estimatedMonths} onChange={e => setForm({ ...form, estimatedMonths: +e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>Milestones (one per line)</Label><Textarea rows={4} placeholder="Complete a system design course&#10;Lead a major feature&#10;Mentor a junior" value={form.milestones} onChange={e => setForm({ ...form, milestones: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={save} disabled={!form.fromRoleId || !form.toRoleId} className="bg-teal-600 hover:bg-teal-700">Create Path</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
