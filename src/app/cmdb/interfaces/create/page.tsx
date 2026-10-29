'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbInterface, CmdbInterfaceType, CmdbComponent, CmdbApplication } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, PlusCircle, Trash2, Network, ChevronLeft, ChevronRight, AlertTriangle, Box, CheckSquare, Code2, Play, Server } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type NewInterfaceFormState = Partial<Omit<CmdbInterface, '_id' | 'created_at' | 'updated_at'>>;

export default function CreateInterfacePage() {
    const [wizardStep, setWizardStep] = useState(1);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    // Original Interface State
    const [formState, setFormState] = useState<NewInterfaceFormState>({
        security: { internal: { secure: false, authentication: false }, external: { secure: false, authentication: false } },
        additional_docs: [],
        custom_fields: []
    });

    // Capability Onboarding State
    const [langs, setLangs] = useState<any[]>([]);
    const [activeLangTab, setActiveLangTab] = useState<string>('');
    const [capForm, setCapForm] = useState({
        supportedLanguages: [] as string[],
        dependenciesByLanguage: {} as Record<string, any>,
        templatesByLanguage: {} as Record<string, string[]>,
        defaultConfigsByLanguage: {} as Record<string, string>,
        infrastructure: { helmChart: '', dockerImage: '' }
    });

    const router = useRouter();
    const { toast } = useToast();

    const [interfaceTypes, setInterfaceTypes] = useState<CmdbInterfaceType[]>([]);
    const [sourceComponents, setSourceComponents] = useState<(CmdbComponent | CmdbApplication)[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<string>('');

    useEffect(() => {
        getUser().then(setUser);
        async function fetchDeps() {
            try {
                const [typesRes, componentsRes, applicationsRes, langsRes, tenantsRes] = await Promise.all([
                    fetch('/api/cmdb/interface-types'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications'),
                    fetch('/api/plugins/sdk-capability-marketplace?module=languages'),
                    fetch('/api/cmdb/tenants')
                ]);

                if (typesRes.ok) setInterfaceTypes(await typesRes.json());
                if (tenantsRes.ok) setTenants(await tenantsRes.json());

                const components = componentsRes.ok ? await componentsRes.json() : [];
                const applications = applicationsRes.ok ? await applicationsRes.json() : [];
                setSourceComponents([...components, ...applications]);

                if (langsRes.ok) {
                    const lData = await langsRes.json();
                    if (lData.data) {
                        setLangs(lData.data);
                        if (lData.data.length > 0) setActiveLangTab(lData.data[0].id);
                    }
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load dependencies.' });
            }
        }
        fetchDeps();
    }, [toast]);

    // Format Input Handlers (Interface)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: 'type' | 'source', value: string) => {
        const list = field === 'type' ? interfaceTypes : sourceComponents;
        const selected = list.find(item => item.id === value);
        if (selected) {
            setFormState(prev => ({ ...prev, [field]: { id: selected.id, name: selected.name } }));
        }
    };

    const handleSecurityChange = (scope: 'internal' | 'external', field: 'secure' | 'authentication', checked: boolean) => {
        setFormState(prev => {
            const sec = prev.security || { internal: { secure: false, authentication: false }, external: { secure: false, authentication: false } };
            return {
                ...prev,
                security: {
                    ...sec,
                    [scope]: { ...sec[scope], [field]: checked }
                }
            };
        });
    };

    const handleDocChange = (index: number, field: 'name' | 'url', value: string) => {
        const updatedDocs = [...(formState.additional_docs || [])];
        updatedDocs[index] = { ...updatedDocs[index], id: updatedDocs[index]?.id || `doc-${index}`, key: updatedDocs[index]?.key || `doc-${index}`, [field]: value };
        setFormState(prev => ({ ...prev, additional_docs: updatedDocs }));
    };

    const addDoc = () => setFormState(prev => ({ ...prev, additional_docs: [...(prev.additional_docs || []), { id: '', key: '', name: '', url: '' }] }));
    const removeDoc = (index: number) => setFormState(prev => ({ ...prev, additional_docs: (formState.additional_docs || []).filter((_, i) => i !== index) }));

    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const updatedFields = [...(formState.custom_fields || [])];
        updatedFields[index] = { ...updatedFields[index], [field]: value };
        setFormState(prev => ({ ...prev, custom_fields: updatedFields }));
    };
    const addCustomField = () => setFormState(prev => ({ ...prev, custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }] }));
    const removeCustomField = (index: number) => setFormState(prev => ({ ...prev, custom_fields: (formState.custom_fields || []).filter((_, i) => i !== index) }));


    // Capability Handlers
    const toggleLanguage = (langId: string) => {
        setCapForm(f => {
            const isSelected = f.supportedLanguages.includes(langId);
            let nextLangs = isSelected
                ? f.supportedLanguages.filter(l => l !== langId)
                : [...f.supportedLanguages, langId];

            let nextActiveTab = activeLangTab;
            if (isSelected && activeLangTab === langId) {
                // if we are removing the active tab, switch to the first available one
                nextActiveTab = nextLangs.length > 0 ? nextLangs[0] : '';
            } else if (!isSelected && nextLangs.length === 1) {
                // if adding the first language, set it active
                nextActiveTab = langId;
            }

            setActiveLangTab(nextActiveTab);

            return {
                ...f,
                supportedLanguages: nextLangs
            };
        });
    };

    const addLangDep = (langId: string) => {
        setCapForm(f => {
            const deps = f.dependenciesByLanguage[langId] || { buildTool: langs.find(l => l.id === langId)?.buildTools?.[0] || 'unknown', dependencies: [] };
            deps.dependencies.push(langId === 'java' ? { groupId: '', artifactId: '', version: '' } : { package: '', version: '' });
            return { ...f, dependenciesByLanguage: { ...f.dependenciesByLanguage, [langId]: deps } };
        });
    };

    const updateLangDep = (langId: string, index: number, field: string, value: string) => {
        setCapForm(f => {
            const block = { ...f.dependenciesByLanguage[langId] };
            block.dependencies[index][field] = value;
            return { ...f, dependenciesByLanguage: { ...f.dependenciesByLanguage, [langId]: block } };
        });
    };

    const removeLangDep = (langId: string, index: number) => {
        setCapForm(f => {
            const block = { ...f.dependenciesByLanguage[langId] };
            block.dependencies.splice(index, 1);
            return { ...f, dependenciesByLanguage: { ...f.dependenciesByLanguage, [langId]: block } };
        });
    };

    // Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const interfaceId = formState.name?.replace(/[^a-zA-Z0-9]/g, '') || `Interface${Date.now()}`;

        // Append Capability config into custom properties
        const combinedCustomFields = [
            ...(formState.custom_fields || []),
            { key: '__capabilityConfiguration', value: JSON.stringify(capForm) }
        ];

        const payload: Partial<CmdbInterface> = {
            ...formState,
            id: interfaceId,
            custom_fields: combinedCustomFields,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        try {
            const response = await fetch('/api/cmdb/interfaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Interface successfully registered with Capability details.' });
                router.push('/cmdb/interfaces');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to register interface.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 bg-slate-50 dark:bg-background h-[calc(100vh-4rem)] overflow-y-auto flex flex-col items-center">
                <form onSubmit={handleSubmit} className="w-full flex justify-center">
                    <Card className="w-full max-w-5xl p-0 overflow-hidden bg-white shadow-sm border mt-4">
                        <div className="flex min-h-[700px]">
                            {/* Left Sidebar Wizard Steps */}
                            <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r p-6 pb-0 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-700 mb-6"><Box className="h-5 w-5" /> Onboarding</h2>
                                    <div className="space-y-1 relative">
                                        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                                        {[
                                            { s: 1, label: 'Interface Details', desc: 'Metadata & Owners' },
                                            { s: 2, label: 'Languages', desc: 'SDK matrices' },
                                            { s: 3, label: 'Dependencies', desc: 'Libraries & Code' },
                                            { s: 4, label: 'Infrastructure', desc: 'Docker & Helm' },
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
                                <div className="flex-1 p-4 md:p-8">
                                    {wizardStep === 1 && (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">Interface Registration</h3>
                                                <p className="text-sm text-muted-foreground">General CMDB details about this interface.</p>
                                            </div>

                                            {/* Restored Accordion logic from original single-screen form */}
                                            <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                                                <AccordionItem value="item-1" className="border px-4 rounded-lg bg-slate-50 mb-2">
                                                    <AccordionTrigger className="hover:no-underline">Basic Information</AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-4 space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div><Label htmlFor="name">Interface Name *</Label><Input id="name" value={formState.name || ''} onChange={handleInputChange} required /></div>
                                                            <div><Label htmlFor="type">Interface Type *</Label>
                                                                <Select value={formState.type?.id} onValueChange={(value) => handleSelectChange('type', value)} required><SelectTrigger className="bg-white"><SelectValue placeholder="Select a type..." /></SelectTrigger>
                                                                    <SelectContent>{interfaceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div><Label htmlFor="tenant">Tenant Filter *</Label>
                                                                <Select value={selectedTenant} onValueChange={(val) => {
                                                                    setSelectedTenant(val);
                                                                    // Clear source if tenant changes and old source is not in new tenant
                                                                    setFormState(prev => ({ ...prev, source: undefined as any }));
                                                                }} required><SelectTrigger className="bg-white"><SelectValue placeholder="Select a tenant..." /></SelectTrigger>
                                                                    <SelectContent>{tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div><Label htmlFor="version">Version *</Label><Input id="version" value={formState.version || ''} onChange={handleInputChange} required /></div>
                                                            <div><Label htmlFor="source">Source Component/App *</Label>
                                                                <Select value={formState.source?.id} onValueChange={(value) => handleSelectChange('source', value)} required disabled={!selectedTenant}><SelectTrigger className="bg-white"><SelectValue placeholder={selectedTenant ? "Select a source..." : "Select Tenant first"} /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {sourceComponents
                                                                            .filter(c => !selectedTenant || c.tenants?.some((t: any) => t.id === selectedTenant))
                                                                            .map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div><Label htmlFor="description">Description</Label><Textarea id="description" value={formState.description || ''} onChange={handleInputChange} /></div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="item-2" className="border px-4 rounded-lg bg-slate-50 mb-2">
                                                    <AccordionTrigger className="hover:no-underline">Ownership & Documentation</AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-4 space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div><Label htmlFor="owner_name">Owner Name *</Label><Input id="owner_name" value={formState.owner_name || ''} onChange={handleInputChange} required /></div>
                                                            <div><Label htmlFor="owner_email">Owner Email *</Label><Input id="owner_email" type="email" value={formState.owner_email || ''} onChange={handleInputChange} required /></div>
                                                        </div>
                                                        <div><Label htmlFor="documentation">Main Documentation URL</Label><Input id="documentation" type="url" value={formState.documentation || ''} onChange={handleInputChange} placeholder="https://docs.example.com" /></div>
                                                        <div><Label>Additional Documents</Label>
                                                            <div className="space-y-2 mt-2">
                                                                {(formState.additional_docs || []).map((doc, index) => (
                                                                    <div key={index} className="flex items-center gap-2">
                                                                        <Input placeholder="Document Name" value={doc.name} onChange={e => handleDocChange(index, 'name', e.target.value)} />
                                                                        <Input placeholder="URL" type="url" value={doc.url} onChange={e => handleDocChange(index, 'url', e.target.value)} />
                                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDoc(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <Button type="button" variant="outline" size="sm" onClick={addDoc} className="mt-2 text-indigo-700 bg-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Document</Button>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="item-3" className="border px-4 rounded-lg bg-slate-50 mb-2">
                                                    <AccordionTrigger className="hover:no-underline">Security</AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <Card className="shadow-none"><CardHeader className="py-2"><CardTitle className="text-sm">Internal Security</CardTitle></CardHeader>
                                                            <CardContent className="space-y-2">
                                                                <div className="flex items-center space-x-2"><Checkbox id="internal-secure" checked={formState.security?.internal?.secure} onCheckedChange={(c) => handleSecurityChange('internal', 'secure', !!c)} /><Label htmlFor="internal-secure">Is Secure</Label></div>
                                                                <div className="flex items-center space-x-2"><Checkbox id="internal-auth" checked={formState.security?.internal?.authentication} onCheckedChange={(c) => handleSecurityChange('internal', 'authentication', !!c)} /><Label htmlFor="internal-auth">Needs Authentication</Label></div>
                                                            </CardContent>
                                                        </Card>
                                                        <Card className="shadow-none"><CardHeader className="py-2"><CardTitle className="text-sm">External Security</CardTitle></CardHeader>
                                                            <CardContent className="space-y-2">
                                                                <div className="flex items-center space-x-2"><Checkbox id="external-secure" checked={formState.security?.external?.secure} onCheckedChange={(c) => handleSecurityChange('external', 'secure', !!c)} /><Label htmlFor="external-secure">Is Secure</Label></div>
                                                                <div className="flex items-center space-x-2"><Checkbox id="external-auth" checked={formState.security?.external?.authentication} onCheckedChange={(c) => handleSecurityChange('external', 'authentication', !!c)} /><Label htmlFor="external-auth">Needs Authentication</Label></div>
                                                            </CardContent>
                                                        </Card>
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="item-4" className="border px-4 rounded-lg bg-slate-50">
                                                    <AccordionTrigger className="hover:no-underline">Custom Fields</AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-4 space-y-4">
                                                        <div className="space-y-2">
                                                            {(formState.custom_fields || []).map((field, index) => (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <Input placeholder="Key" value={field.key} onChange={e => handleCustomFieldChange(index, 'key', e.target.value)} />
                                                                    <Input placeholder="Value" value={field.value} onChange={e => handleCustomFieldChange(index, 'value', e.target.value)} />
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button type="button" variant="outline" size="sm" onClick={addCustomField} className="mt-2 text-indigo-700 bg-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Custom Field</Button>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>

                                        </div>
                                    )}

                                    {wizardStep === 2 && (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">Supported Languages</h3>
                                                <p className="text-sm text-muted-foreground">Select the SDK language generation targets for this interface capability.</p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {langs.map(l => {
                                                    const active = capForm.supportedLanguages.includes(l.id);
                                                    return (
                                                        <div key={l.id} onClick={() => toggleLanguage(l.id)} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${active ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:border-slate-400 bg-white'}`}>
                                                            <div className="font-bold text-sm">{l.name}</div>
                                                            <div className={`h-5 w-5 rounded border flex items-center justify-center ${active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                                {active && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {capForm.supportedLanguages.length === 0 && <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">You must select at least one language context to setup capability details.</div>}
                                        </div>
                                    )}

                                    {wizardStep === 3 && (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 h-full flex flex-col">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">Dependencies & Codes</h3>
                                                <p className="text-sm text-muted-foreground">Map libraries and code templates based on the mapped languages.</p>
                                            </div>
                                            <Tabs value={activeLangTab || capForm.supportedLanguages[0]} onValueChange={setActiveLangTab} className="flex-1 flex flex-col">
                                                <TabsList className="bg-slate-100 flex-wrap h-auto p-1">
                                                    {capForm.supportedLanguages.map(lid => (
                                                        <TabsTrigger key={lid} value={lid} className="capitalize flex-1 data-[state=active]:bg-white">{langs.find(x => x.id === lid)?.name}</TabsTrigger>
                                                    ))}
                                                </TabsList>

                                                {capForm.supportedLanguages.map(lid => (
                                                    <TabsContent key={lid} value={lid} className="flex-1 overflow-auto py-4 space-y-6 outline-none">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                                                <div className="flex items-center gap-2">
                                                                    <Code2 className="h-4 w-4 text-slate-500" />
                                                                    <span className="font-semibold text-sm">Package Libraries</span>
                                                                    <Badge variant="outline" className="text-[10px] ml-2">Tool: {capForm.dependenciesByLanguage[lid]?.buildTool || langs.find(x => x.id === lid)?.buildTools?.[0] || 'auto'}</Badge>
                                                                </div>
                                                                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-indigo-700" onClick={() => addLangDep(lid)}><PlusCircle className="h-3 w-3 mr-1" /> Add Dependency</Button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {(!capForm.dependenciesByLanguage[lid] || capForm.dependenciesByLanguage[lid].dependencies.length === 0) && <p className="text-xs text-muted-foreground italic px-2">No dependencies defined for {lid}</p>}
                                                                {(capForm.dependenciesByLanguage[lid]?.dependencies || []).map((dep: any, idx: number) => (
                                                                    <div key={idx} className="flex items-center gap-2 bg-white border p-2 rounded">
                                                                        {lid === 'java' ? (
                                                                            <>
                                                                                <Input placeholder="groupId" className="h-8 text-xs font-mono" value={dep.groupId || ''} onChange={e => updateLangDep(lid, idx, 'groupId', e.target.value)} />
                                                                                <Input placeholder="artifactId" className="h-8 text-xs font-mono" value={dep.artifactId || ''} onChange={e => updateLangDep(lid, idx, 'artifactId', e.target.value)} />
                                                                            </>
                                                                        ) : (
                                                                            <Input placeholder="Package / Module Name" className="h-8 text-xs font-mono flex-1" value={dep.package || dep.module || ''} onChange={e => updateLangDep(lid, idx, lid === 'golang' ? 'module' : 'package', e.target.value)} />
                                                                        )}
                                                                        <Input placeholder="Version" className="h-8 text-xs font-mono w-24" value={dep.version || ''} onChange={e => updateLangDep(lid, idx, 'version', e.target.value)} />
                                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeLangDep(lid, idx)}><Trash2 className="h-4 w-4" /></Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                                                <div className="flex items-center gap-2">
                                                                    <Play className="h-4 w-4 text-amber-500" />
                                                                    <span className="font-semibold text-sm">Base Configuration Example</span>
                                                                </div>
                                                            </div>
                                                            <Textarea
                                                                rows={18}
                                                                className="text-xs font-mono bg-slate-900 text-amber-400 p-3 leading-relaxed rounded-lg"
                                                                placeholder={
                                                                    lid === 'java'
                                                                        ? `# Generated by the Internal Platform SDK\nspring:\n  application:\n    name: {{app_name}}\n\n  # Database Configuration\n  {{#has_postgres}}\n  datasource:\n    url: {{postgres_url}}\n    username: \${POSTGRES_USER}\n    password: \${POSTGRES_PASSWORD}\n  {{/has_postgres}}\n\n  # Messaging Configuration\n  {{#has_kafka}}\n  kafka:\n    bootstrap-servers: {{kafka_servers}}\n  {{/has_kafka}}`
                                                                        : lid === 'python'
                                                                            ? `# Generated by the Internal Platform SDK\nDATABASES = {\n  {{#has_postgres}}\n  'default': {\n      'ENGINE': 'django.db.backends.postgresql',\n      'NAME': '{{app_name}}',\n      'USER': '\${POSTGRES_USER}',\n      'PASSWORD': '\${POSTGRES_PASSWORD}',\n      'HOST': '{{postgres_host}}',\n      'PORT': '{{postgres_port}}',\n  }\n  {{/has_postgres}}\n}\n\n{{#has_kafka}}\nKAFKA_BROKERS = '{{kafka_servers}}'\n{{/has_kafka}}`
                                                                            : lid === 'nodejs'
                                                                                ? `// Generated by the Internal Platform SDK\nmodule.exports = {\n  appName: '{{app_name}}',\n  {{#has_postgres}}\n  database: {\n    client: 'pg',\n    connection: {\n      host: '{{postgres_host}}',\n      port: {{postgres_port}},\n      user: process.env.POSTGRES_USER,\n      password: process.env.POSTGRES_PASSWORD,\n      database: '{{app_name}}'\n    }\n  },\n  {{/has_postgres}}\n  {{#has_kafka}}\n  kafka: {\n    brokers: ['{{kafka_servers}}']\n  }\n  {{/has_kafka}}\n};`
                                                                                : lid === 'golang'
                                                                                    ? `# Generated by the Internal Platform SDK\nAPP_NAME={{app_name}}\n\n{{#has_postgres}}\nDB_HOST={{postgres_host}}\nDB_PORT={{postgres_port}}\nDB_USER=\${POSTGRES_USER}\nDB_PASSWORD=\${POSTGRES_PASSWORD}\nDB_NAME={{app_name}}\n{{/has_postgres}}\n\n{{#has_kafka}}\nKAFKA_BROKERS={{kafka_servers}}\n{{/has_kafka}}`
                                                                                    : `# Generated by the Internal Platform SDK\n# Add your {{app_name}} configuration template here`
                                                                }
                                                                value={capForm.defaultConfigsByLanguage[lid] || ''}
                                                                onChange={e => setCapForm(f => ({ ...f, defaultConfigsByLanguage: { ...f.defaultConfigsByLanguage, [lid]: e.target.value } }))}
                                                            />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                                                <div className="flex items-center gap-2">
                                                                    <Play className="h-4 w-4 text-emerald-500" />
                                                                    <span className="font-semibold text-sm">Code Templates & Configs</span>
                                                                </div>
                                                            </div>
                                                            <Textarea
                                                                rows={4}
                                                                className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 leading-relaxed rounded-lg"
                                                                placeholder={`e.g.\ntemplates/${lid}/config.mustache`}
                                                                value={(capForm.templatesByLanguage[lid] || []).join('\n')}
                                                                onChange={e => {
                                                                    const arr = e.target.value.split('\n').map(x => x.trim()).filter(Boolean);
                                                                    setCapForm(f => ({ ...f, templatesByLanguage: { ...f.templatesByLanguage, [lid]: arr } }));
                                                                }}
                                                            />
                                                        </div>
                                                    </TabsContent>
                                                ))}
                                            </Tabs>
                                        </div>
                                    )}

                                    {wizardStep === 4 && (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">Infrastructure</h3>
                                                <p className="text-sm text-muted-foreground">Define what cluster components satisfy this capability.</p>
                                            </div>
                                            <Card className="shadow-none border border-slate-200 bg-slate-50">
                                                <CardContent className="pt-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2"><Server className="h-4 w-4" /> Docker Image</Label>
                                                        <Input placeholder="e.g. docker.io/bitnami/kafka:latest" value={capForm.infrastructure?.dockerImage} onChange={e => setCapForm(f => ({ ...f, infrastructure: { ...f.infrastructure, dockerImage: e.target.value } }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2"><Box className="h-4 w-4" /> Helm Chart reference</Label>
                                                        <Input placeholder="e.g. oci://registry-1.docker.io/bitnamicharts/kafka" value={capForm.infrastructure?.helmChart} onChange={e => setCapForm(f => ({ ...f, infrastructure: { ...f.infrastructure, helmChart: e.target.value } }))} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {wizardStep === 5 && (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">Confirm Target Details</h3>
                                                <p className="text-sm text-muted-foreground">Review your interface definition and capability map.</p>
                                            </div>
                                            <div className="bg-slate-50 border rounded-lg p-5">
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 text-sm mb-4">
                                                    <div className="col-span-2 lg:col-span-1"><span className="text-muted-foreground block text-xs uppercase mb-1">Interface Name</span><span className="font-bold">{formState.name}</span></div>
                                                    <div><span className="text-muted-foreground block text-xs uppercase mb-1">Version</span><span className="font-mono">{formState.version}</span></div>
                                                    <div><span className="text-muted-foreground block text-xs uppercase mb-1">Tenant</span><Badge variant="outline" className="font-mono">{tenants.find(t => t.id === selectedTenant)?.name || 'Global'}</Badge></div>
                                                    <div><span className="text-muted-foreground block text-xs uppercase mb-1">Type</span><span className="font-medium text-slate-700">{formState.type?.name}</span></div>

                                                    <div className="col-span-2 lg:col-span-1"><span className="text-muted-foreground block text-xs uppercase mb-1">Source</span><Badge variant="secondary" className="font-mono">{formState.source?.name}</Badge></div>
                                                    <div className="col-span-2 lg:col-span-1"><span className="text-muted-foreground block text-xs uppercase mb-1">Languages Mapped</span><span className="font-medium text-indigo-700">{capForm.supportedLanguages.join(', ') || 'None'}</span></div>

                                                    <div className="col-span-2 lg:col-span-2"><span className="text-muted-foreground block text-xs uppercase mb-1">Owner & Docs</span>
                                                        <span className="font-medium">{formState.owner_name}</span> <span className="text-xs text-muted-foreground">({formState.owner_email})</span>
                                                        {formState.documentation && <a href={formState.documentation} target="_blank" rel="noreferrer" className="block text-xs text-blue-600 hover:underline mt-1 truncate">{formState.documentation}</a>}
                                                    </div>
                                                </div>

                                                <div className="border-t pt-4">
                                                    <p className="text-muted-foreground text-xs uppercase mb-2">Composed Blueprint (JSON)</p>
                                                    <div className="bg-slate-900 rounded p-4 text-emerald-400 font-mono text-[10px] overflow-auto max-h-56">
                                                        <pre>{JSON.stringify({ interface: { ...formState, tenant: selectedTenant }, capability: capForm }, null, 2)}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-xs flex items-start gap-2 border border-yellow-200">
                                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                                <p>Submitting this form will register the interface and its associated capability parameters.</p>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Wizard Footer */}
                                <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0 rounded-br-lg">
                                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel Onboarding</Button>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" disabled={wizardStep === 1} onClick={() => setWizardStep(s => s - 1)}><ChevronLeft className="h-4 w-4 mr-2" /> Back</Button>

                                        {wizardStep < 5 ? (
                                            <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={(wizardStep === 1 && (!formState.name || !formState.type || !formState.version || !formState.source || !formState.owner_name || !formState.owner_email))} onClick={() => setWizardStep(s => s + 1)}>Next Step <ChevronRight className="h-4 w-4 ml-2" /></Button>
                                        ) : (
                                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Register Capability Target
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
