'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, Layers, Activity, Server, Cpu, Plus, GitMerge, RefreshCw } from 'lucide-react';

const API = '/api/plugins/se-system-composition-manager';

export default function SystemCompositionWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><SystemCompositionPage /></DashboardLayout>;
}

function SystemCompositionPage() {
    const [stats, setStats] = useState<any>({});
    const [systems, setSystems] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [bbs, setBbs] = useState<any[]>([]);
    const [functions, setFunctions] = useState<any[]>([]);

    const [tab, setTab] = useState('dashboard');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('system'); // system, product, bb, function

    const [sysForm, setSysForm] = useState({ id: '', name: '', description: '' });
    const [prodForm, setProdForm] = useState({ id: '', systemId: '', name: '', version: '1.0.0' });
    const [bbForm, setBbForm] = useState({ id: '', type: 'BB', parentId: '', name: '', functionalGroup: '', linkedProducts: [] as string[] });
    const [fnForm, setFnForm] = useState({ id: '', name: '', linkedTo: '', type: 'Function' });

    const fetchAll = useCallback(async () => {
        const [dash, sys, prod, bb, fn] = await Promise.all([
            fetch(`${API}?module=dashboard`).then(r => r.json()),
            fetch(`${API}?module=systems`).then(r => r.json()),
            fetch(`${API}?module=products`).then(r => r.json()),
            fetch(`${API}?module=building-blocks`).then(r => r.json()),
            fetch(`${API}?module=functions`).then(r => r.json()),
        ]);
        if (dash.data) setStats(dash.data);
        if (sys.data) setSystems(sys.data);
        if (prod.data) setProducts(prod.data);
        if (bb.data) setBbs(bb.data);
        if (fn.data) setFunctions(fn.data);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const seedInit = async () => {
        await fetch(`${API}?module=init`);
        fetchAll();
    };

    const saveSys = async () => {
        await fetch(`${API}?module=systems`, { method: 'POST', body: JSON.stringify({ ...sysForm, id: sysForm.id || `SYS-${Date.now().toString().slice(-4)}` }) });
        setDialogOpen(false); fetchAll();
    };
    const saveProd = async () => {
        await fetch(`${API}?module=products`, { method: 'POST', body: JSON.stringify({ ...prodForm, id: prodForm.id || `PRD-${Date.now().toString().slice(-4)}` }) });
        setDialogOpen(false); fetchAll();
    };
    const saveBb = async () => {
        await fetch(`${API}?module=building-blocks`, { method: 'POST', body: JSON.stringify({ ...bbForm, id: bbForm.id || `BLK-${Date.now().toString().slice(-4)}` }) });
        setDialogOpen(false); fetchAll();
    };
    const saveFn = async () => {
        await fetch(`${API}?module=functions`, { method: 'POST', body: JSON.stringify({ ...fnForm, id: fnForm.id || `FN-${Date.now().toString().slice(-4)}` }) });
        setDialogOpen(false); fetchAll();
    };

    const deleteItem = async (mod: string, id: string) => {
        await fetch(`${API}?module=${mod}&id=${id}`, { method: 'DELETE' });
        fetchAll();
    };

    const openDialog = (type: string) => {
        setDialogType(type);
        setSysForm({ id: '', name: '', description: '' });
        setProdForm({ id: '', systemId: '', name: '', version: '1.0.0' });
        setBbForm({ id: '', type: 'BB', parentId: '', name: '', functionalGroup: '', linkedProducts: [] });
        setFnForm({ id: '', name: '', linkedTo: '', type: 'Function' });
        setDialogOpen(true);
    };

    const getSystem = (id: string) => systems.find(s => s.id === id)?.name || id;
    const parentName = (id: string) => bbs.find(b => b.id === id)?.name || id;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center"><Box className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">System Composition</h1><p className="text-sm text-muted-foreground">Architect systems, products, and building blocks</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={seedInit}><RefreshCw className="h-4 w-4 mr-2" />Seed Demo</Button>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => openDialog('system')}><Plus className="h-4 w-4 mr-2" />New System</Button>
                </div>
            </div>

            <div className="p-4 pb-0">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="systems">Systems & Products</TabsTrigger>
                        <TabsTrigger value="bbs">Building Blocks (BB/SBB)</TabsTrigger>
                        <TabsTrigger value="functions">Technical Functions</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-auto p-6 pt-4">
                {tab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="shadow-none"><CardContent className="p-4 flex items-center gap-3"><Server className="h-8 w-8 text-indigo-500" /><div><p className="text-2xl font-bold">{stats.sysCount || 0}</p><p className="text-xs text-muted-foreground">Systems Defined</p></div></CardContent></Card>
                            <Card className="shadow-none"><CardContent className="p-4 flex items-center gap-3"><Layers className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.prodCount || 0}</p><p className="text-xs text-muted-foreground">Products</p></div></CardContent></Card>
                            <Card className="shadow-none"><CardContent className="p-4 flex items-center gap-3"><Cpu className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">{stats.bbCount || 0}</p><p className="text-xs text-muted-foreground">Total BBs / SBBs</p></div></CardContent></Card>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="shadow-none">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
                                    <div className="space-y-2">
                                        {(stats.recentAudit || []).map((a: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                                                <div><Badge variant="outline" className="mr-2 text-[9px]">{a.action}</Badge><span className="font-medium">{a.entityId}</span></div>
                                                <span className="text-muted-foreground">{new Date(a.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm mb-3">Functional Groups</h3>
                                    <div className="space-y-2">
                                        {(stats.bbGroups || []).map((g: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                                                <span className="font-medium text-indigo-700 dark:text-indigo-400">{g._id || 'Unassigned'}</span>
                                                <Badge>{g.count} blocks</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {tab === 'systems' && (
                    <div className="space-y-6">
                        <div className="flex justify-end"><Button size="sm" onClick={() => openDialog('product')}><Plus className="h-3 w-3 mr-1" /> Add Product</Button></div>
                        <div className="grid lg:grid-cols-2 gap-4">
                            {systems.map(s => (
                                <Card key={s.id} className="shadow-none border-indigo-100 dark:border-indigo-900/40">
                                    <CardContent className="p-0">
                                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 border-b flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-indigo-900 dark:text-indigo-100">{s.name} <span className="font-mono text-xs text-indigo-400 ml-2">{s.id}</span></p>
                                                <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70">{s.description}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteItem('systems', s.id)}>✕</Button>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Products in System</p>
                                            {products.filter(p => p.systemId === s.id).map(p => (
                                                <div key={p.id} className="flex items-center justify-between bg-white dark:bg-slate-900 border p-2 rounded text-sm">
                                                    <div><span className="font-medium">{p.name}</span> <Badge variant="outline" className="text-[10px] ml-1">v{p.version}</Badge></div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-muted-foreground">{p.id}</span>
                                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-500" onClick={() => deleteItem('products', p.id)}>✕</Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {products.filter(p => p.systemId === s.id).length === 0 && <p className="text-xs text-muted-foreground italic">No products declared.</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'bbs' && (
                    <div className="space-y-4">
                        <div className="flex justify-end"><Button size="sm" onClick={() => openDialog('bb')}><Plus className="h-3 w-3 mr-1" /> Add BB / SBB</Button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {bbs.map(b => (
                                <Card key={b.id} className="shadow-none border-l-4 border-l-blue-500">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge className={`text-[10px] ${b.type === 'BB' ? 'bg-blue-600' : 'bg-violet-600'}`}>{b.type}</Badge>
                                            <span className="text-xs font-mono text-muted-foreground">{b.id}</span>
                                        </div>
                                        <p className="font-bold text-sm">{b.name}</p>
                                        {b.functionalGroup && <p className="text-xs text-blue-600 mt-1">{b.functionalGroup}</p>}
                                        {b.type === 'SBB' && <p className="text-xs text-muted-foreground mt-2 border-t pt-2 flex items-center gap-1"><GitMerge className="h-3 w-3" /> Child of: {parentName(b.parentId)}</p>}
                                        {b.type === 'BB' && (b.linkedProducts || []).length > 0 && <div className="mt-2 pt-2 border-t flex flex-wrap gap-1">{(b.linkedProducts || []).map((lp: string) => <Badge key={lp} variant="outline" className="text-[9px]">{lp}</Badge>)}</div>}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'functions' && (
                    <div className="space-y-4">
                        <div className="flex justify-end"><Button size="sm" onClick={() => openDialog('function')}><Plus className="h-3 w-3 mr-1" /> Add Function</Button></div>
                        <div className="bg-white dark:bg-slate-900 border rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800/50 uppercase border-b">
                                    <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Function Signature</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Linked To (BB/SBB)</th><th className="px-4 py-3"></th></tr>
                                </thead>
                                <tbody>
                                    {functions.map(f => (
                                        <tr key={f.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.id}</td>
                                            <td className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-400">{f.name}</td>
                                            <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{f.type}</Badge></td>
                                            <td className="px-4 py-3 text-sm">{parentName(f.linkedTo)}</td>
                                            <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => deleteItem('functions', f.id)}>✕</Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Combined Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === 'system' ? 'Create System' : dialogType === 'product' ? 'Add Product' : dialogType === 'bb' ? 'Add Building Block' : 'Add Technical Function'}
                        </DialogTitle>
                    </DialogHeader>

                    {dialogType === 'system' && (
                        <div className="space-y-3 py-2">
                            <div><Label>System Name</Label><Input value={sysForm.name} onChange={e => setSysForm({ ...sysForm, name: e.target.value })} /></div>
                            <div><Label>Description</Label><Input value={sysForm.description} onChange={e => setSysForm({ ...sysForm, description: e.target.value })} /></div>
                            <Button onClick={saveSys} className="w-full">Save System</Button>
                        </div>
                    )}

                    {dialogType === 'product' && (
                        <div className="space-y-3 py-2">
                            <div><Label>System</Label>
                                <Select value={prodForm.systemId} onValueChange={v => setProdForm({ ...prodForm, systemId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select system..." /></SelectTrigger>
                                    <SelectContent>{systems.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div><Label>Product Name</Label><Input value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} /></div>
                            <div><Label>Version</Label><Input value={prodForm.version} onChange={e => setProdForm({ ...prodForm, version: e.target.value })} /></div>
                            <Button onClick={saveProd} className="w-full" disabled={!prodForm.systemId}>Save Product</Button>
                        </div>
                    )}

                    {dialogType === 'bb' && (
                        <div className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label>Node Type</Label>
                                    <Select value={bbForm.type} onValueChange={v => setBbForm({ ...bbForm, type: v, parentId: v === 'BB' ? '' : bbForm.parentId })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="BB">Building Block (BB)</SelectItem><SelectItem value="SBB">Sub-Building Block (SBB)</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Functional Group</Label><Input placeholder="e.g. Perception, Control" value={bbForm.functionalGroup} onChange={e => setBbForm({ ...bbForm, functionalGroup: e.target.value })} /></div>
                            </div>

                            {bbForm.type === 'SBB' && (
                                <div><Label>Parent BB</Label>
                                    <Select value={bbForm.parentId} onValueChange={v => setBbForm({ ...bbForm, parentId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select parent Building Block..." /></SelectTrigger>
                                        <SelectContent>{bbs.filter(b => b.type === 'BB').map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            )}
                            {bbForm.type === 'BB' && (
                                <div><Label>Linked Product (Optional)</Label>
                                    <Select onValueChange={v => setBbForm({ ...bbForm, linkedProducts: [v] })}>
                                        <SelectTrigger><SelectValue placeholder="Link to explicit product..." /></SelectTrigger>
                                        <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div><Label>Name</Label><Input value={bbForm.name} onChange={e => setBbForm({ ...bbForm, name: e.target.value })} /></div>
                            <Button onClick={saveBb} className="w-full">Save Block</Button>
                        </div>
                    )}

                    {dialogType === 'function' && (
                        <div className="space-y-3 py-2">
                            <div><Label>Signature / Name</Label><Input placeholder="e.g. DetectPedestrians()" value={fnForm.name} onChange={e => setFnForm({ ...fnForm, name: e.target.value })} /></div>
                            <div><Label>Type</Label>
                                <Select value={fnForm.type} onValueChange={v => setFnForm({ ...fnForm, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Function">Function</SelectItem><SelectItem value="Interface">Interface</SelectItem><SelectItem value="Method">Method</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div><Label>Assigned To (BB/SBB)</Label>
                                <Select value={fnForm.linkedTo} onValueChange={v => setFnForm({ ...fnForm, linkedTo: v })}>
                                    <SelectTrigger><SelectValue placeholder="Link function to block..." /></SelectTrigger>
                                    <SelectContent>{bbs.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.type})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <Button onClick={saveFn} className="w-full" disabled={!fnForm.linkedTo}>Save Function</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
