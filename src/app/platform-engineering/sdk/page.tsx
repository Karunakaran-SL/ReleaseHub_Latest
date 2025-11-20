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
import { Plus, Rocket, GitBranch, ArrowRight, ArrowLeft, Download, AlertTriangle, Monitor, Server, Trash2, Save, Loader2 } from 'lucide-react';
import { DependencyDialog } from './_components/dependency-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Dependency } from './_components/dependency-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
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

export default function SdkGeneratorPage() {
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data for Step 1
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<CmdbTenant | null>(null);
    const [projectName, setProjectName] = useState('demo');
    const [group, setGroup] = useState('com.example');
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    
    // Data for Step 2
    const [repoUrl, setRepoUrl] = useState('');
    const [pipelineType, setPipelineType] = useState('');

    // Data for Step 3 & 4
    const [environmentType, setEnvironmentType] = useState<'development' | 'test' | null>(null);
    const [availableEnvironments, setAvailableEnvironments] = useState<(DevelopmentEnvironment | TestEnvironment)[]>([]);
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);

    // Data for Step 5 & 6
    const [availableSimulators, setAvailableSimulators] = useState<Simulator[]>([]);
    const [availableEmulators, setAvailableEmulators] = useState<Emulator[]>([]);
    const [selectedSimulators, setSelectedSimulators] = useState<string[]>([]);
    const [selectedEmulators, setSelectedEmulators] = useState<string[]>([]);
    const [simulatorConfigs, setSimulatorConfigs] = useState<Record<string, SimEmulatorConfig>>({});
    const [emulatorConfigs, setEmulatorConfigs] = useState<Record<string, SimEmulatorConfig>>({});


    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [tenantsRes, devEnvsRes, testEnvsRes, simsRes, emusRes] = await Promise.all([
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/platform-engineering/development-environments'),
                    fetch('/api/platform-engineering/test-environments'),
                    fetch('/api/platform-engineering/simulators'),
                    fetch('/api/platform-engineering/emulators'),
                ]);
                if (tenantsRes.ok) setTenants(await tenantsRes.json());
                
                const devEnvs = devEnvsRes.ok ? await devEnvsRes.json() : [];
                const testEnvs = testEnvsRes.ok ? await testEnvsRes.json() : [];
                setAvailableEnvironments([...devEnvs, ...testEnvs]);

                if (simsRes.ok) setAvailableSimulators(await simsRes.json());
                if (emusRes.ok) setAvailableEmulators(await emusRes.json());
                
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch initial data.' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleTenantChange = (tenantId: string) => {
        const tenant = tenants.find(t => t.id === tenantId);
        if (tenant) {
            setSelectedTenant(tenant);
            setProjectName(tenant.name.toLowerCase().replace(/\s+/g, '-'));
            setGroup(`com.example.${tenant.id.toLowerCase()}`);
        }
    };

    const handleGenerate = () => {
        toast({
            title: 'Project Generated!',
            description: `Proceed to configure deployment options.`,
        });
        handleNext();
    };

    const handleDownload = () => {
        toast({
            title: 'Downloading Project...',
            description: `A zip file for ${projectName} would be downloaded here.`,
        });
    };

    const updateInstanceCount = (type: 'simulator' | 'emulator', id: string, name: string, countStr: string) => {
        const count = parseInt(countStr, 10) || 0;
        const configSetter = type === 'simulator' ? setSimulatorConfigs : setEmulatorConfigs;
        
        configSetter(prev => {
            const existing = prev[id] || { id, name, instanceCount: 0, instances: [] };
            const newInstances = Array.from({ length: count }).map((_, i) => 
                existing.instances[i] || { name: `${name}-${i + 1}`, ip: '', user: 'admin', pass: '' }
            );
            return {
                ...prev,
                [id]: { ...existing, instanceCount: count, instances: newInstances }
            };
        });
    };
    
    const updateInstanceConfig = (type: 'simulator' | 'emulator', id: string, instanceIndex: number, field: keyof InstanceConfig, value: string) => {
        const configSetter = type === 'simulator' ? setSimulatorConfigs : setEmulatorConfigs;
        configSetter(prev => {
            const newConfig = { ...prev[id] };
            newConfig.instances[instanceIndex] = { ...newConfig.instances[instanceIndex], [field]: value };
            return { ...prev, [id]: newConfig };
        });
    };
    
    const handleSaveConfiguration = async () => {
        setLoading(true);
        const payload = {
            projectName,
            group,
            dependencies,
            repoUrl,
            pipelineType,
            environmentType,
            environmentId: selectedEnvironmentId,
            simulators: Object.values(simulatorConfigs).filter(s => selectedSimulators.includes(s.id)),
            emulators: Object.values(emulatorConfigs).filter(e => selectedEmulators.includes(e.id)),
        };

        try {
            const response = await fetch('/api/platform-engineering/sdk-apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to save configuration.');
            toast({ title: 'Success', description: 'SDK application configuration saved.' });
            router.push('/platform-engineering/sdk/apps');
            router.refresh();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };


    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Tenant</CardTitle>
                                    <CardDescription>Select the tenant this project will be for.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Select onValueChange={handleTenantChange}>
                                        <SelectTrigger><SelectValue placeholder="Select a tenant..." /></SelectTrigger>
                                        <SelectContent>
                                            {tenants.map(tenant => (
                                                <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle>Project Metadata</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label htmlFor="group">Group</Label><Input id="group" value={group} onChange={e => setGroup(e.target.value)} /></div>
                                        <div className="space-y-2"><Label htmlFor="artifact">Artifact</Label><Input id="artifact" value={projectName} onChange={e => setProjectName(e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={projectName} onChange={e => setProjectName(e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" placeholder={`Demo project for ${selectedTenant?.name || 'Spring Boot'}`} /></div>
                                    <div className="space-y-2"><Label htmlFor="package-name">Package name</Label><Input id="package-name" value={`${group}.${projectName}`} disabled /></div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Language & Framework</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <Label className="mb-2 block">Language</Label>
                                        <RadioGroup defaultValue="java" className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="java" id="java" /><Label htmlFor="java">Java</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="kotlin" id="kotlin" /><Label htmlFor="kotlin">Kotlin</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="groovy" id="groovy" /><Label htmlFor="groovy">Groovy</Label></div>
                                        </RadioGroup>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Framework Version</Label>
                                        <RadioGroup defaultValue="3.5.7" className="flex flex-wrap gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="4.0.0-snapshot" id="v4s" /><Label htmlFor="v4s">4.0.0 (SNAPSHOT)</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="3.5.7" id="v357" /><Label htmlFor="v357">3.5.7</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="3.4.11" id="v3411" /><Label htmlFor="v3411">3.4.11</Label></div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Dependencies</CardTitle>
                                    <DependencyDialog onAddDependencies={setDependencies} />
                                </CardHeader>
                                <CardContent>
                                    {dependencies.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No dependencies selected.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {dependencies.map(dep => (
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
                            <Input id="repo-url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/your-org/your-repo.git" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="pipeline-type">CI/CD Pipeline</Label>
                             <Select value={pipelineType} onValueChange={setPipelineType}>
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
                        <RadioGroup value={environmentType || ''} onValueChange={(v) => setEnvironmentType(v as 'development' | 'test')} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dev-env" className={cn("flex flex-col gap-2 border rounded-md p-4 cursor-pointer hover:bg-accent", {
                                    'bg-accent border-primary ring-2 ring-primary': environmentType === 'development'
                                })}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="development" id="dev-env" />
                                        <span className="font-semibold text-lg">Development Environment</span>
                                    </div>
                                    <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
                                        <AlertTriangle className="h-4 w-4 text-blue-500" />
                                        <AlertTitle>For Functional Testing</AlertTitle>
                                        <AlertDescription>Lightweight and cost-effective, intended for development and functional validation only.</AlertDescription>
                                    </Alert>
                                </Label>
                            </div>
                            <div>
                               <Label htmlFor="test-env" className={cn("flex flex-col gap-2 border rounded-md p-4 cursor-pointer hover:bg-accent", {
                                    'bg-accent border-primary ring-2 ring-primary': environmentType === 'test'
                                })}>
                                     <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="test" id="test-env" />
                                        <span className="font-semibold text-lg">Test Environment</span>
                                    </div>
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>High Cost & For E2E Testing</AlertTitle>
                                        <AlertDescription>More expensive, full-scale environment for non-functional and end-to-end performance testing.</AlertDescription>
                                    </Alert>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                );
             case 4:
                const envs = availableEnvironments.filter(env => (env as any).createdBy !== undefined); // Simple way to filter based on type
                return (
                     <div className="space-y-4">
                         <Label>Select an available <strong>{environmentType}</strong> environment to deploy to:</Label>
                         <RadioGroup value={selectedEnvironmentId || ''} onValueChange={setSelectedEnvironmentId}>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {envs.length > 0 ? envs.map(env => (
                                     <Label key={env._id} htmlFor={env._id} className={cn("flex flex-col gap-2 border rounded-md p-4 cursor-pointer hover:bg-accent", {
                                        'bg-accent border-primary ring-2 ring-primary': selectedEnvironmentId === env._id
                                    })}>
                                         <div className="flex items-center space-x-2">
                                            <RadioGroupItem value={env._id} id={env._id} />
                                            <span className="font-semibold">{env.name}</span>
                                        </div>
                                         <p className="text-xs text-muted-foreground">Product: {env.productName}</p>
                                          <p className="text-xs text-muted-foreground">Spec: {env.specName}</p>
                                     </Label>
                                )) : <p className="text-muted-foreground col-span-full text-center">No available {environmentType} environments found.</p>}
                             </div>
                         </RadioGroup>
                     </div>
                );
            case 5:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Simulators</h3>
                            <MultiSelectListBox
                                available={availableSimulators.filter(s => !selectedSimulators.includes(s._id)).map(s => ({id: s._id, label: s.name}))}
                                chosen={selectedSimulators.map(id => ({id, label: availableSimulators.find(s => s._id === id)?.name || ''}))}
                                onMoveToChosen={ids => setSelectedSimulators(p => [...p, ...ids])}
                                onMoveToAvailable={ids => setSelectedSimulators(p => p.filter(id => !ids.includes(id)))}
                                onMoveAllToChosen={() => setSelectedSimulators(availableSimulators.map(s => s._id))}
                                onMoveAllToAvailable={() => setSelectedSimulators([])}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Emulators</h3>
                             <MultiSelectListBox
                                available={availableEmulators.filter(s => !selectedEmulators.includes(s._id)).map(s => ({id: s._id, label: s.name}))}
                                chosen={selectedEmulators.map(id => ({id, label: availableEmulators.find(s => s._id === id)?.name || ''}))}
                                onMoveToChosen={ids => setSelectedEmulators(p => [...p, ...ids])}
                                onMoveToAvailable={ids => setSelectedEmulators(p => p.filter(id => !ids.includes(id)))}
                                onMoveAllToChosen={() => setSelectedEmulators(availableEmulators.map(s => s._id))}
                                onMoveAllToAvailable={() => setSelectedEmulators([])}
                            />
                        </div>
                    </div>
                )
            case 6:
                return (
                    <div className="space-y-6">
                        {selectedSimulators.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Configure Simulators</h3>
                                {selectedSimulators.map(id => {
                                    const sim = availableSimulators.find(s => s._id === id);
                                    if (!sim) return null;
                                    return (
                                        <Card key={id}>
                                            <CardHeader><CardTitle>{sim.name}</CardTitle></CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="w-48"><Label>Number of Instances</Label><Input type="number" min="0" value={simulatorConfigs[id]?.instanceCount || 0} onChange={e => updateInstanceCount('simulator', id, sim.name, e.target.value)} /></div>
                                                {(simulatorConfigs[id]?.instances || []).map((inst, i) => (
                                                    <div key={i} className="p-4 border rounded-md grid grid-cols-2 gap-4">
                                                        <Input placeholder="Instance Name" value={inst.name} onChange={e => updateInstanceConfig('simulator', id, i, 'name', e.target.value)} />
                                                        <Input placeholder="IP Address" value={inst.ip} onChange={e => updateInstanceConfig('simulator', id, i, 'ip', e.target.value)} />
                                                        <Input placeholder="Username" value={inst.user} onChange={e => updateInstanceConfig('simulator', id, i, 'user', e.target.value)} />
                                                        <Input type="password" placeholder="Password" value={inst.pass} onChange={e => updateInstanceConfig('simulator', id, i, 'pass', e.target.value)} />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                        {selectedEmulators.length > 0 && (
                             <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Configure Emulators</h3>
                                {selectedEmulators.map(id => {
                                    const emu = availableEmulators.find(e => e._id === id);
                                    if (!emu) return null;
                                    return (
                                        <Card key={id}>
                                            <CardHeader><CardTitle>{emu.name}</CardTitle></CardHeader>
                                             <CardContent className="space-y-4">
                                                <div className="w-48"><Label>Number of Instances</Label><Input type="number" min="0" value={emulatorConfigs[id]?.instanceCount || 0} onChange={e => updateInstanceCount('emulator', id, emu.name, e.target.value)} /></div>
                                                {(emulatorConfigs[id]?.instances || []).map((inst, i) => (
                                                    <div key={i} className="p-4 border rounded-md grid grid-cols-2 gap-4">
                                                        <Input placeholder="Instance Name" value={inst.name} onChange={e => updateInstanceConfig('emulator', id, i, 'name', e.target.value)} />
                                                        <Input placeholder="IP Address" value={inst.ip} onChange={e => updateInstanceConfig('emulator', id, i, 'ip', e.target.value)} />
                                                        <Input placeholder="Username" value={inst.user} onChange={e => updateInstanceConfig('emulator', id, i, 'user', e.target.value)} />
                                                        <Input type="password" placeholder="Password" value={inst.pass} onChange={e => updateInstanceConfig('emulator', id, i, 'pass', e.target.value)} />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            case 7:
                 return (
                    <div className="space-y-4 text-sm">
                        <h3 className="font-semibold text-lg">Summary</h3>
                        <p><strong>Project:</strong> {projectName}</p>
                        <p><strong>Dependencies:</strong> {dependencies.length > 0 ? dependencies.map(d => d.name).join(', ') : 'None'}</p>
                        <p><strong>Git Repo:</strong> {repoUrl || 'Not configured'}</p>
                        <p><strong>CI/CD:</strong> {pipelineType || 'Not configured'}</p>
                        <p><strong>Environment Type:</strong> <span className="capitalize">{environmentType || 'Not Selected'}</span></p>
                        <p><strong>Environment:</strong> {availableEnvironments.find(e => e._id === selectedEnvironmentId)?.name || 'Not Selected'}</p>
                        <p><strong>Simulators:</strong> {selectedSimulators.map(id => availableSimulators.find(s=>s._id === id)?.name).join(', ') || 'None'}</p>
                        <p><strong>Emulators:</strong> {selectedEmulators.map(id => availableEmulators.find(e=>e._id === id)?.name).join(', ') || 'None'}</p>
                    </div>
                );
            default:
                return null;
        }
    }

    const getStepDescription = () => {
        switch(step) {
            case 1: return "Bootstrap your tenant-aware application with pre-configured dependencies.";
            case 2: return "Configure Git repository and CI/CD pipeline.";
            case 3: return "Select an environment for deployment and testing.";
            case 4: return "Choose a specific provisioned environment instance.";
            case 5: return "Select simulators and emulators for your test setup.";
            case 6: return "Configure instances for your selected simulators and emulators.";
            case 7: return "Review all your selections before finishing.";
            default: return "SDK Project Initializer"
        }
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="max-w-6xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Rocket className="h-10 w-10 text-primary"/>
                            <div>
                                <h1 className="text-3xl font-bold">SDK Project Initializer</h1>
                                <p className="text-muted-foreground">{getStepDescription()}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-[60vh]">
                       {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> : renderStepContent()}
                    </CardContent>
                     <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                         </Button>
                        <div className="flex items-center gap-4">
                            {(step === 1 || step === 2) && <Button variant="secondary" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Skip & Download</Button>}
                             {step < 7 ? (
                                <Button onClick={step === 1 ? handleGenerate : handleNext}>
                                    Next <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            ) : (
                                <Button onClick={handleSaveConfiguration} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} 
                                    Save Configuration
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
