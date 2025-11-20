
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbTenant, DevelopmentEnvironment, TestEnvironment, Simulator, Emulator } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Rocket, GitBranch, ArrowRight, ArrowLeft, Download, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { DependencyDialog } from '../../../_components/dependency-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Dependency } from '../../../_components/dependency-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useRouter, useParams } from 'next/navigation';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';

interface InstanceConfig {
    name: string;
    ip: string;
    user: string;
    pass: string;
}
interface SimEmulatorConfig {
    id: string;
    name: string;
    instanceCount: number;
    instances: InstanceConfig[];
}

interface SdkAppConfig {
    _id: string;
    projectName: string;
    group: string;
    dependencies: Dependency[];
    repoUrl?: string;
    pipelineType?: string;
    environmentType?: 'development' | 'test';
    environmentId?: string;
    simulators?: SimEmulatorConfig[];
    emulators?: SimEmulatorConfig[];
}

export default function EditSdkAppPage() {
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formState, setFormState] = useState<Partial<SdkAppConfig>>({});
    
    // Data for dropdowns
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [availableEnvironments, setAvailableEnvironments] = useState<(DevelopmentEnvironment | TestEnvironment)[]>([]);
    const [availableSimulators, setAvailableSimulators] = useState<Simulator[]>([]);
    const [availableEmulators, setAvailableEmulators] = useState<Emulator[]>([]);

    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            if (!id) {
                toast({ variant: 'destructive', title: 'Error', description: 'No App ID provided.' });
                router.push('/platform-engineering/sdk/apps');
                return;
            }
            
            try {
                const [appRes, tenantsRes, devEnvsRes, testEnvsRes, simsRes, emusRes] = await Promise.all([
                    fetch(`/api/platform-engineering/sdk-apps/${id}`),
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/platform-engineering/development-environments'),
                    fetch('/api/platform-engineering/test-environments'),
                    fetch('/api/platform-engineering/simulators'),
                    fetch('/api/platform-engineering/emulators'),
                ]);

                if (!appRes.ok) throw new Error('Failed to fetch app configuration.');
                const appData = await appRes.json();
                
                const simConfigs: Record<string, SimEmulatorConfig> = {};
                (appData.simulators || []).forEach((s: SimEmulatorConfig) => { simConfigs[s.id] = s; });

                const emuConfigs: Record<string, SimEmulatorConfig> = {};
                (appData.emulators || []).forEach((e: SimEmulatorConfig) => { emuConfigs[e.id] = e; });

                setFormState({
                    ...appData,
                    simulators: simConfigs,
                    emulators: emuConfigs,
                    selectedSimulators: (appData.simulators || []).map((s: any) => s.id),
                    selectedEmulators: (appData.emulators || []).map((e: any) => e.id)
                });

                if (tenantsRes.ok) setTenants(await tenantsRes.json());
                const devEnvs = devEnvsRes.ok ? await devEnvsRes.json() : [];
                const testEnvs = testEnvsRes.ok ? await testEnvsRes.json() : [];
                setAvailableEnvironments([...devEnvs, ...testEnvs]);

                if (simsRes.ok) setAvailableSimulators(await simsRes.json());
                if (emusRes.ok) setAvailableEmulators(await emusRes.json());
                
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, toast, router]);
    
    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    
    const updateInstanceCount = (type: 'simulators' | 'emulators', id: string, name: string, countStr: string) => {
        const count = parseInt(countStr, 10) || 0;
        setFormState(prev => {
            const configs = { ...(prev as any)[type] };
            const existing = configs[id] || { id, name, instanceCount: 0, instances: [] };
            const newInstances = Array.from({ length: count }).map((_, i) => 
                existing.instances[i] || { name: `${name.substring(0, 10)}-${i + 1}`, ip: '', user: 'admin', pass: '' }
            );
            configs[id] = { ...existing, instanceCount: count, instances: newInstances };
            return { ...prev, [type]: configs };
        });
    };
    
    const updateInstanceConfig = (type: 'simulators' | 'emulators', id: string, instanceIndex: number, field: keyof InstanceConfig, value: string) => {
        setFormState(prev => {
            const configs = { ...(prev as any)[type] };
            const newConfig = { ...configs[id] };
            newConfig.instances[instanceIndex] = { ...newConfig.instances[instanceIndex], [field]: value };
            configs[id] = newConfig;
            return { ...prev, [type]: configs };
        });
    };

    const handleSaveConfiguration = async () => {
        setLoading(true);
        setIsSaving(true);
        const { selectedSimulators, selectedEmulators, ...payloadBase } = formState as any;
        
        const payload = {
            ...payloadBase,
            simulators: Object.values(payloadBase.simulators || {}).filter((s: any) => selectedSimulators.includes(s.id)),
            emulators: Object.values(payloadBase.emulators || {}).filter((e: any) => selectedEmulators.includes(e.id)),
        };

        try {
            const response = await fetch(`/api/platform-engineering/sdk-apps/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to save configuration.');
            toast({ title: 'Success', description: 'SDK application configuration updated.' });
            router.push('/platform-engineering/sdk/apps');
            router.refresh();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
            setIsSaving(false);
        }
    };
    
    const renderStepContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
        }

        switch (step) {
            case 1:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                             <Card>
                                <CardHeader><CardTitle>Project Metadata</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label htmlFor="group">Group</Label><Input id="group" value={formState.group || ''} onChange={e => setFormState(p => ({...p, group: e.target.value}))} /></div>
                                        <div className="space-y-2"><Label htmlFor="artifact">Artifact</Label><Input id="artifact" value={formState.projectName || ''} onChange={e => setFormState(p => ({...p, projectName: e.target.value}))} /></div>
                                    </div>
                                    <div className="space-y-2"><Label htmlFor="package-name">Package name</Label><Input id="package-name" value={`${formState.group || ''}.${formState.projectName || ''}`} disabled /></div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Dependencies</CardTitle>
                                    <DependencyDialog onAddDependencies={(deps) => setFormState(p => ({...p, dependencies: deps}))} />
                                </CardHeader>
                                <CardContent>
                                    {formState.dependencies?.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No dependencies selected.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {formState.dependencies?.map(dep => (
                                                <Badge key={dep.id} variant="secondary">{dep.name}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            case 2:
                 return (
                     <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="repo-url">Git Repository URL</Label>
                            <Input id="repo-url" value={formState.repoUrl || ''} onChange={e => setFormState(p => ({...p, repoUrl: e.target.value}))} placeholder="https://github.com/your-org/your-repo.git" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="pipeline-type">CI/CD Pipeline</Label>
                             <Select value={formState.pipelineType} onValueChange={(v) => setFormState(p => ({...p, pipelineType: v}))}>
                                <SelectTrigger><SelectValue placeholder="Select a pipeline type..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jenkins">Jenkinsfile</SelectItem>
                                    <SelectItem value="gitlab">GitLab CI (.gitlab-ci.yml)</SelectItem>
                                    <SelectItem value="github">GitHub Actions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <RadioGroup value={formState.environmentType || ''} onValueChange={(v) => setFormState(p => ({...p, environmentType: v as any}))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="dev-env" className={cn("flex flex-col gap-2 border rounded-md p-4 cursor-pointer hover:bg-accent", {'bg-accent border-primary ring-2 ring-primary': formState.environmentType === 'development'})}><div className="flex items-center space-x-2"><RadioGroupItem value="development" id="dev-env" /><span className="font-semibold text-lg">Development Environment</span></div><Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/20"><AlertTriangle className="h-4 w-4 text-blue-500" /><AlertTitle>For Functional Testing</AlertTitle><AlertDescription>Lightweight and cost-effective, for development and functional validation.</AlertDescription></Alert></Label></div>
                            <div><Label htmlFor="test-env" className={cn("flex flex-col gap-2 border rounded-md p-4 cursor-pointer hover:bg-accent", {'bg-accent border-primary ring-2 ring-primary': formState.environmentType === 'test'})}><div className="flex items-center space-x-2"><RadioGroupItem value="test" id="test-env" /><span className="font-semibold text-lg">Test Environment</span></div><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>High Cost & For E2E Testing</AlertTitle><AlertDescription>More expensive, full-scale environment for non-functional and end-to-end testing.</AlertDescription></Alert></Label></div>
                        </RadioGroup>
                    </div>
                );
            case 4:
                const envs = availableEnvironments.filter(env => ((env as DevelopmentEnvironment).createdBy !== undefined ? 'development' : 'test') === formState.environmentType);
                return (
                     <div className="space-y-4">
                         <Label>Select an available <strong>{formState.environmentType}</strong> environment:</Label>
                         <RadioGroup value={formState.environmentId || ''} onValueChange={(v) => setFormState(p => ({...p, environmentId: v}))}>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {envs.length > 0 ? envs.map(env => (
                                     <Label key={env._id} htmlFor={env._id} className={cn("flex flex-col gap-2 border rounded-md p-4 cursor-pointer hover:bg-accent", {'bg-accent border-primary ring-2 ring-primary': formState.environmentId === env._id})}><div className="flex items-center space-x-2"><RadioGroupItem value={env._id} id={env._id} /><span className="font-semibold">{env.name}</span></div><p className="text-xs text-muted-foreground">Product: {env.productName}</p><p className="text-xs text-muted-foreground">Spec: {env.specName}</p></Label>
                                )) : <p className="text-muted-foreground col-span-full text-center">No available {formState.environmentType} environments found.</p>}
                             </div>
                         </RadioGroup>
                     </div>
                );
            case 5:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4"><h3 className="text-lg font-semibold">Simulators</h3><MultiSelectListBox available={availableSimulators.filter(s => !(formState as any).selectedSimulators.includes(s._id)).map(s => ({id: s._id, label: s.name}))} chosen={(formState as any).selectedSimulators.map((id: string) => ({id, label: availableSimulators.find(s => s._id === id)?.name || ''}))} onMoveToChosen={ids => setFormState(p => ({...p, selectedSimulators: [...(p as any).selectedSimulators, ...ids]}))} onMoveToAvailable={ids => setFormState(p => ({...p, selectedSimulators: (p as any).selectedSimulators.filter((id: string) => !ids.includes(id))}))} onMoveAllToChosen={() => setFormState(p => ({...p, selectedSimulators: availableSimulators.map(s => s._id)}))} onMoveAllToAvailable={() => setFormState(p => ({...p, selectedSimulators: []}))} /></div>
                        <div className="space-y-4"><h3 className="text-lg font-semibold">Emulators</h3><MultiSelectListBox available={availableEmulators.filter(s => !(formState as any).selectedEmulators.includes(s._id)).map(s => ({id: s._id, label: s.name}))} chosen={(formState as any).selectedEmulators.map((id: string) => ({id, label: availableEmulators.find(s => s._id === id)?.name || ''}))} onMoveToChosen={ids => setFormState(p => ({...p, selectedEmulators: [...(p as any).selectedEmulators, ...ids]}))} onMoveToAvailable={ids => setFormState(p => ({...p, selectedEmulators: (p as any).selectedEmulators.filter((id: string) => !ids.includes(id))}))} onMoveAllToChosen={() => setFormState(p => ({...p, selectedEmulators: availableEmulators.map(s => s._id)}))} onMoveAllToAvailable={() => setFormState(p => ({...p, selectedEmulators: []}))} /></div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                        {(formState as any).selectedSimulators?.length > 0 && <div className="space-y-4"><h3 className="text-lg font-semibold">Configure Simulators</h3>{(formState as any).selectedSimulators.map((id: string) => { const sim = availableSimulators.find(s => s._id === id); if (!sim) return null; return (<Card key={id}><CardHeader><CardTitle>{sim.name}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="w-48"><Label>Number of Instances</Label><Input type="number" min="0" value={(formState as any).simulators?.[id]?.instanceCount || 0} onChange={e => updateInstanceCount('simulators', id, sim.name, e.target.value)} /></div>{((formState as any).simulators?.[id]?.instances || []).map((inst: InstanceConfig, i: number) => (<div key={i} className="p-4 border rounded-md grid grid-cols-2 gap-4"><Input placeholder="Instance Name" value={inst.name} onChange={e => updateInstanceConfig('simulators', id, i, 'name', e.target.value)} /><Input placeholder="IP Address" value={inst.ip} onChange={e => updateInstanceConfig('simulators', id, i, 'ip', e.target.value)} /><Input placeholder="Username" value={inst.user} onChange={e => updateInstanceConfig('simulators', id, i, 'user', e.target.value)} /><Input type="password" placeholder="Password" value={inst.pass} onChange={e => updateInstanceConfig('simulators', id, i, 'pass', e.target.value)} /></div>))}</CardContent></Card>)})}</div>}
                        {(formState as any).selectedEmulators?.length > 0 && <div className="space-y-4"><h3 className="text-lg font-semibold">Configure Emulators</h3>{(formState as any).selectedEmulators.map((id: string) => { const emu = availableEmulators.find(e => e._id === id); if (!emu) return null; return (<Card key={id}><CardHeader><CardTitle>{emu.name}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="w-48"><Label>Number of Instances</Label><Input type="number" min="0" value={(formState as any).emulators?.[id]?.instanceCount || 0} onChange={e => updateInstanceCount('emulators', id, emu.name, e.target.value)} /></div>{((formState as any).emulators?.[id]?.instances || []).map((inst: InstanceConfig, i: number) => (<div key={i} className="p-4 border rounded-md grid grid-cols-2 gap-4"><Input placeholder="Instance Name" value={inst.name} onChange={e => updateInstanceConfig('emulators', id, i, 'name', e.target.value)} /><Input placeholder="IP Address" value={inst.ip} onChange={e => updateInstanceConfig('emulators', id, i, 'ip', e.target.value)} /><Input placeholder="Username" value={inst.user} onChange={e => updateInstanceConfig('emulators', id, i, 'user', e.target.value)} /><Input type="password" placeholder="Password" value={inst.pass} onChange={e => updateInstanceConfig('emulators', id, i, 'pass', e.target.value)} /></div>))}</CardContent></Card>)})}</div>}
                    </div>
                );
            case 7:
                 return (
                    <div className="space-y-4 text-sm">
                        <h3 className="font-semibold text-lg">Summary</h3>
                        <p><strong>Project:</strong> {formState.projectName}</p>
                        <p><strong>Dependencies:</strong> {formState.dependencies?.length ? formState.dependencies.map(d => d.name).join(', ') : 'None'}</p>
                        <p><strong>Git Repo:</strong> {formState.repoUrl || 'Not configured'}</p>
                        <p><strong>CI/CD:</strong> {formState.pipelineType || 'Not configured'}</p>
                        <p><strong>Environment Type:</strong> <span className="capitalize">{formState.environmentType || 'Not Selected'}</span></p>
                        <p><strong>Environment:</strong> {availableEnvironments.find(e => e._id === formState.environmentId)?.name || 'Not Selected'}</p>
                        <p><strong>Simulators:</strong> {(formState as any).selectedSimulators?.map((id: string) => availableSimulators.find(s=>s._id === id)?.name).join(', ') || 'None'}</p>
                        <p><strong>Emulators:</strong> {(formState as any).selectedEmulators?.map((id: string) => availableEmulators.find(e=>e._id === id)?.name).join(', ') || 'None'}</p>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="max-w-6xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Rocket className="h-10 w-10 text-primary"/>
                            <div>
                                <h1 className="text-3xl font-bold">Edit SDK App Configuration</h1>
                                <p className="text-muted-foreground">Project: {formState?.projectName}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-[60vh]">
                       {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> : renderStepContent()}
                    </CardContent>
                     <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSaving}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                         </Button>
                        <div className="flex items-center gap-4">
                             {step < 7 ? (
                                <Button onClick={handleNext}>
                                    Next <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            ) : (
                                <Button onClick={handleSaveConfiguration} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} 
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
