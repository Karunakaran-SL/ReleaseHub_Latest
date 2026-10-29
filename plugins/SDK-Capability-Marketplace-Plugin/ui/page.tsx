'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Server, ShieldCheck, RefreshCw, Plus, Key, Box, Database, MessageSquare, AlertTriangle, ChevronRight, ChevronLeft, Trash2, Code2, Play, CheckCircle } from 'lucide-react';

const API = '/api/plugins/sdk-capability-marketplace';

export default function RegistryWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><RegistryPage user={user} /></DashboardLayout>;
}

function RegistryPage({ user }: { user: User | null }) {
    const [caps, setCaps] = useState<any[]>([]);
    const [langs, setLangs] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);

    // Complex Wizard State
    const [form, setForm] = useState({
        id: '', name: '', category: 'databases', description: '',
        supportedLanguages: [] as string[],
        dependenciesByLanguage: {} as Record<string, any>,
        templatesByLanguage: {} as Record<string, string[]>,
        infrastructure: { helmChart: '', dockerImage: '' }
    });

    // Temporary step state
    const [activeLangTab, setActiveLangTab] = useState<string>('');

    const fetchAll = useCallback(async () => {
        const [c, l] = await Promise.all([
            fetch(`${API}?module=capabilities`).then(r => r.json()),
            fetch(`${API}?module=languages`).then(r => r.json()),
        ]);
        if (c.data) setCaps(c.data);
        if (l.data) {
            setLangs(l.data);
            if (l.data.length > 0) setActiveLangTab(l.data[0].id);
        }
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const seedInit = async () => {
        await fetch(`${API}?module=init`);
        fetchAll();
    };

    const saveCap = async () => {
        await fetch(`${API}?module=capabilities`, { method: 'POST', body: JSON.stringify(form) });
        setDialogOpen(false);
        fetchAll();
    };

    const updateStatus = async (id: string, currentStatus: string) => {
        let nextStatus = currentStatus === 'PENDING_APPROVAL' ? 'ACTIVE' : currentStatus === 'ACTIVE' ? 'DEPRECATED' : 'ACTIVE';
        await fetch(`${API}?module=capabilities&id=${id}`, { method: 'PUT', body: JSON.stringify({ status: nextStatus }) });
        fetchAll();
    };

    const deleteCap = async (id: string) => {
        await fetch(`${API}?module=capabilities&id=${id}`, { method: 'DELETE' });
        fetchAll();
    };

    const toggleLanguage = (langId: string) => {
        const curr = [...form.supportedLanguages];
        const hasLang = curr.includes(langId);
        if (hasLang) {
            const next = curr.filter(l => l !== langId);
            setForm(f => {
                const dep = { ...f.dependenciesByLanguage }; delete dep[langId];
                const tpl = { ...f.templatesByLanguage }; delete tpl[langId];
                return { ...f, supportedLanguages: next, dependenciesByLanguage: dep, templatesByLanguage: tpl };
            });
            if (activeLangTab === langId) setActiveLangTab(next[0] || '');
        } else {
            setForm(f => ({ ...f, supportedLanguages: [...curr, langId] }));
            if (!activeLangTab) setActiveLangTab(langId);
        }
    };

    // Generic Add Dependency mapping per language
    const addLangDep = (langId: string) => {
        setForm(f => {
            const deps = f.dependenciesByLanguage[langId] || { buildTool: langs.find(l => l.id === langId)?.buildTools?.[0] || 'unknown', dependencies: [] };
            deps.dependencies.push(langId === 'java' ? { groupId: '', artifactId: '', version: '' } : { package: '', version: '' });
            return { ...f, dependenciesByLanguage: { ...f.dependenciesByLanguage, [langId]: deps } };
        });
    };

    const updateLangDep = (langId: string, index: number, field: string, value: string) => {
        setForm(f => {
            const block = { ...f.dependenciesByLanguage[langId] };
            block.dependencies[index][field] = value;
            return { ...f, dependenciesByLanguage: { ...f.dependenciesByLanguage, [langId]: block } };
        });
    };

    const removeLangDep = (langId: string, index: number) => {
        setForm(f => {
            const block = { ...f.dependenciesByLanguage[langId] };
            block.dependencies.splice(index, 1);
            return { ...f, dependenciesByLanguage: { ...f.dependenciesByLanguage, [langId]: block } };
        });
    };

    const handleFormRest = () => {
        setForm({ id: '', name: '', category: 'databases', description: '', supportedLanguages: [], dependenciesByLanguage: {}, templatesByLanguage: {}, infrastructure: { helmChart: '', dockerImage: '' } });
        setWizardStep(1);
    };

    const iconForCategory = (cat: string) => {
        if (cat === 'databases') return <Database className="h-5 w-5 text-blue-500" />;
        if (cat === 'messaging') return <MessageSquare className="h-5 w-5 text-emerald-500" />;
        if (cat === 'security') return <Key className="h-5 w-5 text-orange-500" />;
        return <Box className="h-5 w-5 text-slate-500" />;
    };

    const statusProps = (s: string) => {
        if (s === 'ACTIVE') return { label: 'Active', classes: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
        if (s === 'DEPRECATED') return { label: 'Deprecated', classes: 'bg-red-100 text-red-800 border-red-300' };
        return { label: 'Pending Review', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse' };
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center"><ShoppingCart className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Capability Marketplace</h1><p className="text-sm text-muted-foreground">Discover and publish reusable platform SDKs/Services</p></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={seedInit}><RefreshCw className="h-4 w-4 mr-2" />Seed Demo</Button>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => { handleFormRest(); setDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />Publish Capability
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
                {caps.map(c => {
                    const st = statusProps(c.status);
                    return (
                        <Card key={c.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">{iconForCategory(c.category)}</div>
                                        <div>
                                            <CardTitle className="text-base">{c.name}</CardTitle>
                                            <CardDescription className="font-mono text-[10px] mt-0.5">{c.id}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider cursor-pointer ${st.classes}`} onClick={() => updateStatus(c.id, c.status)}>{st.label}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{c.description}</p>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Language Coverage</p>
                                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                                        {(c.supportedLanguages || []).map((l: string) => (
                                            <Badge key={l} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700">{langs.find(lx => lx.id === l)?.name || l}</Badge>
                                        ))}
                                    </div>
                                </div>

                                {c.infrastructure && (c.infrastructure.helmChart || c.infrastructure.dockerImage) && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded border text-xs font-mono text-muted-foreground flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Server className="h-3 w-3" /> Infra: {c.infrastructure.helmChart || c.infrastructure.dockerImage || 'Defined'}</span>
                                    </div>
                                )}

                                <div className="pt-2 border-t flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteCap(c.id)}>Unpublish</Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {caps.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
                        <Box className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">No Capabilities Published</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">The marketplace is currently empty. Click "Publish Capability" to start the onboarding wizard.</p>
                    </div>
                )}
            </div>

            {/* Rich Wizard Dialog */}
            <Dialog open={dialogOpen} onOpenChange={o => { if (!o) setDialogOpen(false); }}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white">
                    <DialogTitle className="sr-only">Capability Onboarding Wizard</DialogTitle>
                    <div className="flex h-[600px]">

                        {/* Left Sidebar Wizard Steps */}
                        <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r p-6 pb-0 flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-700 mb-6"><Box className="h-5 w-5" /> Onboarding</h2>
                                <div className="space-y-1 relative">
                                    <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                                    {[
                                        { s: 1, label: 'Metadata', desc: 'Basic info & category' },
                                        { s: 2, label: 'Languages', desc: 'Select support matrix' },
                                        { s: 3, label: 'Dependencies', desc: 'Libraries & Code' },
                                        { s: 4, label: 'Infrastructure', desc: 'Docker & Helm details' },
                                        { s: 5, label: 'Review', desc: 'Confirm & submit' }
                                    ].map(st => (
                                        <div key={st.s} className={`flex items-start gap-4 p-2 rounded-lg cursor-pointer transition-colors ${wizardStep === st.s ? 'bg-indigo-50 dark:bg-indigo-900/40' : wizardStep > st.s ? 'hover:bg-slate-100' : 'opacity-50'}`} onClick={() => { if (st.s < wizardStep) setWizardStep(st.s) }}>
                                            <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border-2 ${wizardStep === st.s ? 'bg-indigo-600 text-white border-indigo-600' : wizardStep > st.s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-300 text-slate-400'}`}>
                                                {st.s}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${wizardStep === st.s ? 'text-indigo-700 dark:text-indigo-400' : ''}`}>{st.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{st.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex-1 overflow-auto p-8">

                                {wizardStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Capability Metadata</h3>
                                            <p className="text-sm text-muted-foreground">Define the identity and physical categorization of the capability.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Capability ID</Label><Input value={form.id} onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="e.g. redis-cache" /></div>
                                            <div className="space-y-2"><Label>Display Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Redis Cache" /></div>
                                        </div>
                                        <div className="space-y-2"><Label>Category</Label>
                                            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {['databases', 'messaging', 'cache', 'security', 'storage', 'observability', 'internal-sdk'].map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2"><Label>Description</Label><Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this capability do?" /></div>
                                    </div>
                                )}

                                {wizardStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Supported Languages</h3>
                                            <p className="text-sm text-muted-foreground">Select the languages that have SDK bindings, libraries, or configurations mapped into this capability.</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {langs.map(l => {
                                                const active = form.supportedLanguages.includes(l.id);
                                                return (
                                                    <div key={l.id} onClick={() => toggleLanguage(l.id)} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${active ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:border-slate-400 bg-white'}`}>
                                                        <div className="font-bold text-sm">{l.name}</div>
                                                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                            {active && <CheckCircle className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {form.supportedLanguages.length === 0 && <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">You must select at least one supported language to continue.</div>}
                                    </div>
                                )}

                                {wizardStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 h-full flex flex-col">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Dependencies & Codes</h3>
                                            <p className="text-sm text-muted-foreground">Map libraries and code templates based on the selected languages.</p>
                                        </div>
                                        <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="flex-1 flex flex-col">
                                            <TabsList className="bg-slate-100 flex-wrap h-auto p-1">
                                                {form.supportedLanguages.map(lid => (
                                                    <TabsTrigger key={lid} value={lid} className="capitalize flex-1 data-[state=active]:bg-white">{langs.find(x => x.id === lid)?.name}</TabsTrigger>
                                                ))}
                                            </TabsList>

                                            {form.supportedLanguages.map(lid => (
                                                <TabsContent key={lid} value={lid} className="flex-1 overflow-auto py-4 space-y-6 outline-none">

                                                    {/* Libraries Section */}
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                                            <div className="flex items-center gap-2">
                                                                <Code2 className="h-4 w-4 text-slate-500" />
                                                                <span className="font-semibold text-sm">Package Libraries</span>
                                                                <Badge variant="outline" className="text-[10px] ml-2">Tool: {form.dependenciesByLanguage[lid]?.buildTool || langs.find(x => x.id === lid)?.buildTools?.[0] || 'auto'}</Badge>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-700" onClick={() => addLangDep(lid)}><Plus className="h-3 w-3 mr-1" /> Add Dependency</Button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {(!form.dependenciesByLanguage[lid] || form.dependenciesByLanguage[lid].dependencies.length === 0) && <p className="text-xs text-muted-foreground italic px-2">No dependencies defined for {lid}</p>}
                                                            {(form.dependenciesByLanguage[lid]?.dependencies || []).map((dep: any, idx: number) => (
                                                                <div key={idx} className="flex items-center gap-2 bg-white border p-2 rounded">
                                                                    {lid === 'java' ? (
                                                                        <>
                                                                            <Input placeholder="groupId" className="h-8 text-xs" value={dep.groupId || ''} onChange={e => updateLangDep(lid, idx, 'groupId', e.target.value)} />
                                                                            <Input placeholder="artifactId" className="h-8 text-xs" value={dep.artifactId || ''} onChange={e => updateLangDep(lid, idx, 'artifactId', e.target.value)} />
                                                                        </>
                                                                    ) : (
                                                                        <Input placeholder="Package / Module Name" className="h-8 text-xs flex-1" value={dep.package || dep.module || ''} onChange={e => updateLangDep(lid, idx, lid === 'golang' ? 'module' : 'package', e.target.value)} />
                                                                    )}
                                                                    <Input placeholder="Version" className="h-8 text-xs w-24" value={dep.version || ''} onChange={e => updateLangDep(lid, idx, 'version', e.target.value)} />
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeLangDep(lid, idx)}><Trash2 className="h-4 w-4" /></Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Code Templates Section */}
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                                            <div className="flex items-center gap-2">
                                                                <Play className="h-4 w-4 text-emerald-500" />
                                                                <span className="font-semibold text-sm">Code Templates & Configs</span>
                                                            </div>
                                                        </div>
                                                        <Textarea
                                                            rows={3}
                                                            className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 leading-relaxed rounded-lg"
                                                            placeholder={`e.g.\ntemplates/${lid}/config.mustache\ntemplates/${lid}/Consumer.mustache`}
                                                            value={(form.templatesByLanguage[lid] || []).join('\n')}
                                                            onChange={e => {
                                                                const arr = e.target.value.split('\n').map(x => x.trim()).filter(Boolean);
                                                                setForm(f => ({ ...f, templatesByLanguage: { ...f.templatesByLanguage, [lid]: arr } }));
                                                            }}
                                                        />
                                                        <p className="text-[10px] text-muted-foreground px-1">Define relative paths to the internal Template Repository `.mustache` generation scaffolding hooks.</p>
                                                    </div>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </div>
                                )}

                                {wizardStep === 4 && (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">On-Premises Infrastructure</h3>
                                            <p className="text-sm text-muted-foreground">Define what cluster components run this capability.</p>
                                        </div>
                                        <Card className="shadow-none border-t-indigo-500 border-t-4 bg-slate-50/50">
                                            <CardContent className="pt-6 space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2"><Server className="h-4 w-4" /> Docker Image</Label>
                                                    <Input placeholder="e.g. bitnami/kafka:latest" value={form.infrastructure?.dockerImage} onChange={e => setForm(f => ({ ...f, infrastructure: { ...f.infrastructure, dockerImage: e.target.value } }))} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2"><Box className="h-4 w-4" /> Helm Chart reference</Label>
                                                    <Input placeholder="e.g. bitnami/kafka" value={form.infrastructure?.helmChart} onChange={e => setForm(f => ({ ...f, infrastructure: { ...f.infrastructure, helmChart: e.target.value } }))} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <p className="text-xs text-muted-foreground italic">Both fields are optional if the capability is a cloud-native SDK without required physical infrastructure.</p>
                                    </div>
                                )}

                                {wizardStep === 5 && (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Confirm Target Details</h3>
                                            <p className="text-sm text-muted-foreground">Review your capability before publishing it to the Internal Developer Portal.</p>
                                        </div>
                                        <div className="bg-slate-50 border rounded-lg p-5">
                                            <div className="grid grid-cols-2 gap-y-4 text-sm mb-4">
                                                <div><span className="text-muted-foreground block text-xs uppercase mb-1">Capability ID</span><span className="font-mono">{form.id}</span></div>
                                                <div><span className="text-muted-foreground block text-xs uppercase mb-1">Display Name</span><span className="font-bold">{form.name}</span></div>
                                                <div><span className="text-muted-foreground block text-xs uppercase mb-1">Category</span><Badge variant="outline" className="capitalize">{form.category}</Badge></div>
                                                <div><span className="text-muted-foreground block text-xs uppercase mb-1">Languages Supported</span><span className="font-medium text-indigo-700">{form.supportedLanguages.join(', ')}</span></div>
                                            </div>
                                            <div className="border-t pt-4">
                                                <p className="text-muted-foreground text-xs uppercase mb-2">JSON Blueprint</p>
                                                <div className="bg-slate-900 rounded p-4 text-emerald-400 font-mono text-[10px] overflow-auto max-h-48">
                                                    <pre>{JSON.stringify(form, null, 2)}</pre>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-xs flex items-start gap-2 border border-yellow-200">
                                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>This capability will enter the <strong>PENDING_APPROVAL</strong> state on submission. Platform Admins must review it before it becomes active for SDK generation.</p>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Wizard Footer / Navigation Controllers */}
                            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 flex justify-between items-center rounded-br-lg shrink-0">
                                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Exit Setup</Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" disabled={wizardStep === 1} onClick={() => setWizardStep(s => s - 1)}><ChevronLeft className="h-4 w-4 mr-2" /> Back</Button>

                                    {wizardStep < 5 ? (
                                        <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={(wizardStep === 1 && (!form.id || !form.name)) || (wizardStep === 2 && form.supportedLanguages.length === 0)} onClick={() => setWizardStep(s => s + 1)}>Next Step <ChevronRight className="h-4 w-4 ml-2" /></Button>
                                    ) : (
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={saveCap}>Publish to Marketplace</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
