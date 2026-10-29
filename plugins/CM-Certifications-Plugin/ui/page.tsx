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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, AlertTriangle, Plus, RefreshCw, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = '/api/plugins/cm-certifications';
const EMP_API = '/api/plugins/cm-employee-profiles';
const SKILL_API = '/api/plugins/cm-skill-taxonomy';

export default function CertsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><CertificationsPage /></DashboardLayout>;
}

function CertificationsPage() {
    const [certs, setCerts] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [tab, setTab] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ id: '', employeeId: '', name: '', issuedBy: '', issuedDate: '', validUntil: '', linkedCompetencyId: '', verificationUrl: '' });

    const fetchAll = useCallback(async () => {
        const [c, e, s] = await Promise.all([fetch(API).then(r => r.json()), fetch(`${EMP_API}?module=employees`).then(r => r.json()), fetch(`${SKILL_API}?module=competencies`).then(r => r.json())]);
        if (c.data) setCerts(c.data);
        if (e.data) setEmployees(e.data);
        if (s.data) setCompetencies(s.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = tab === 'all' ? certs : certs.filter(c => c.status === tab);
    const statusColor = (s: string) => s === 'valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s === 'expiring_soon' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200';

    const save = async () => {
        const emp = employees.find(e => e.id === form.employeeId);
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...form, id: form.id || `CERT-${Date.now().toString().slice(-4)}`, employeeName: emp?.name || '' }) });
        setDialogOpen(false);
        setForm({ id: '', employeeId: '', name: '', issuedBy: '', issuedDate: '', validUntil: '', linkedCompetencyId: '', verificationUrl: '' });
        fetchAll();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center"><Award className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Certifications</h1><p className="text-sm text-muted-foreground">{certs.filter(c => c.status === 'expiring_soon').length} expiring soon · {certs.filter(c => c.status === 'expired').length} expired</p></div>
                </div>
                <div className="flex gap-2"><Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button><Button className="bg-yellow-600 hover:bg-yellow-700" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Certificate</Button></div>
            </div>
            <div className="p-4 pb-0">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="valid">Valid</TabsTrigger><TabsTrigger value="expiring_soon">Expiring Soon</TabsTrigger><TabsTrigger value="expired">Expired</TabsTrigger></TabsList>
                </Tabs>
            </div>
            <div className="flex-1 overflow-auto p-6 pt-4 grid gap-3 content-start">
                {filtered.map(c => (
                    <Card key={c.id} className="shadow-none">
                        <CardContent className="py-3 px-4 flex items-center gap-4">
                            <Award className="h-8 w-8 text-yellow-500 shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5"><p className="font-semibold text-sm">{c.name}</p><Badge className={`text-[10px] border ${statusColor(c.status)}`}>{c.status.replace('_', ' ')}</Badge></div>
                                <p className="text-xs text-muted-foreground">{c.employeeName || c.employeeId} · {c.issuedBy}</p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                                <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />Issued: {c.issuedDate ? new Date(c.issuedDate).toLocaleDateString() : '–'}</p>
                                <p className={`flex items-center gap-1 ${c.status === 'expired' ? 'text-red-500' : c.status === 'expiring_soon' ? 'text-orange-500' : ''}`}>
                                    {c.status !== 'valid' && <AlertTriangle className="h-3 w-3" />}Expires: {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '–'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Certificate</DialogTitle><DialogDescription>Record an employee certification and link it to a competency.</DialogDescription></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5"><Label>Employee</Label>
                            <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Certificate Name <span className="text-red-500">*</span></Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. AWS Solutions Architect" /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>Issued By</Label><Input value={form.issuedBy} onChange={e => setForm({ ...form, issuedBy: e.target.value })} placeholder="AWS, Google, PMI…" /></div>
                            <div className="space-y-1.5"><Label>Linked Competency</Label>
                                <Select value={form.linkedCompetencyId} onValueChange={v => setForm({ ...form, linkedCompetencyId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                                    <SelectContent>{competencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>Issue Date</Label><Input type="date" value={form.issuedDate} onChange={e => setForm({ ...form, issuedDate: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Expiry Date</Label><Input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} /></div>
                        </div>
                        <div className="space-y-1.5"><Label>Verification URL</Label><Input value={form.verificationUrl} onChange={e => setForm({ ...form, verificationUrl: e.target.value })} placeholder="https://…" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={save} disabled={!form.name || !form.employeeId} className="bg-yellow-600 hover:bg-yellow-700">Add Certificate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
