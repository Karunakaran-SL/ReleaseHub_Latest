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
import { Store, Briefcase, Plus, RefreshCw, Clock, Users } from 'lucide-react';

const API = '/api/plugins/cm-marketplace';
const EMP_API = '/api/plugins/cm-employee-profiles';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';

export default function MarketplaceWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><MarketplacePage /></DashboardLayout>;
}

function MarketplacePage() {
    const [opps, setOpps] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ id: '', title: '', description: '', department: '', commitment: '3 months', status: 'open' });

    const fetchAll = useCallback(async () => {
        const [o, e] = await Promise.all([fetch(API).then(r => r.json()), fetch(`${EMP_API}?module=employees`).then(r => r.json())]);
        if (o.data) setOpps(o.data);
        if (e.data) setEmployees(e.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const apply = async (opp: any) => {
        const emp = employees[0]; // apply as first employee for demo
        if (!emp) return;
        await fetch(API, { method: 'POST', body: JSON.stringify({ actionType: 'APPLY', opportunityId: opp.id, employeeId: emp.id }) });
        fetchAll();
    };

    const save = async () => {
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...form, id: form.id || `OPP-${Date.now().toString().slice(-4)}`, createdAt: new Date() }) });
        setDialogOpen(false);
        setForm({ id: '', title: '', description: '', department: '', commitment: '3 months', status: 'open' });
        fetchAll();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center"><Store className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Talent Marketplace</h1><p className="text-sm text-muted-foreground">{opps.filter(o => o.status === 'open').length} open opportunities</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Post Opportunity</Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                {opps.map(opp => (
                    <Card key={opp.id} className="shadow-none hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <Badge className={`text-[10px] ${opp.status === 'open' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500'}`}>{opp.status}</Badge>
                                <span className="text-xs text-muted-foreground">{opp.department}</span>
                            </div>
                            <p className="font-semibold text-sm mb-1">{opp.title}</p>
                            <p className="text-xs text-muted-foreground mb-3">{opp.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{opp.commitment}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{opp.applications?.length || 0} applied</span>
                                </div>
                                {opp.status === 'open' && <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => apply(opp)}>Apply</Button>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent><DialogHeader><DialogTitle>Post Opportunity</DialogTitle><DialogDescription>Create an internal gig posting for employees to apply to.</DialogDescription></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5"><Label>Title <span className="text-red-500">*</span></Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI Platform – Python Lead" /></div>
                        <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Commitment</Label>
                                <Select value={form.commitment} onValueChange={v => setForm({ ...form, commitment: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{['1 month', '3 months', '6 months', '12 months'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.title} className="bg-indigo-600 hover:bg-indigo-700">Post</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
