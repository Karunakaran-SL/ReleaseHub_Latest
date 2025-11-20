
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbTenant, DevelopmentEnvironment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Rocket, GitBranch, ArrowRight, ArrowLeft, Download, AlertTriangle, Monitor, Server, Trash2 } from 'lucide-react';
import { DependencyDialog } from './_components/dependency-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Dependency } from './_components/dependency-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SdkGeneratorPage() {
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState(1);

    // Data for Step 1
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<CmdbTenant | null>(null);
    const [projectName, setProjectName] = useState('demo');
    const [group, setGroup] = useState('com.example');
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    
    // Data for Step 2
    const [repoUrl, setRepoUrl] = useState('');
    const [pipelineType, setPipelineType] = useState('');

    // Data for Step 3
    const [environments, setEnvironments] = useState<DevelopmentEnvironment[]>([]);
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);

    // Data for Step 4
    const [simulators, setSimulators] = useState<{ id: number; name: string; ip: string; user: string; pass: string; }[]>([]);
    const [emulators, setEmulators] = useState<{ id: number; name: string; ip: string; user: string; pass: string; }[]>([]);


    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            try {
                const [tenantsRes, devEnvsRes] = await Promise.all([
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/development-environments')
                ]);
                if (tenantsRes.ok) setTenants(await tenantsRes.json());
                if (devEnvsRes.ok) setEnvironments(await devEnvsRes.json());
                
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch initial data.' });
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
    }

    const addInstance = (type: 'simulator' | 'emulator') => {
        const setter = type === 'simulator' ? setSimulators : setEmulators;
        setter(prev => [...prev, { id: Date.now(), name: '', ip: '', user: '', pass: '' }]);
    };
    
    const updateInstance = (type: 'simulator' | 'emulator', index: number, field: string, value: string) => {
        const setter = type === 'simulator' ? setSimulators : setEmulators;
        setter(prev => {
            const newInstances = [...prev];
            newInstances[index] = { ...newInstances[index], [field]: value };
            return newInstances;
        });
    };

    const removeInstance = (type: 'simulator' | 'emulator', id: number) => {
        const setter = type === 'simulator' ? setSimulators : setEmulators;
        setter(prev => prev.filter(item => item.id !== id));
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
                        <RadioGroup value={selectedEnvironmentId || ''} onValueChange={setSelectedEnvironmentId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dev-env" className={cn("flex flex-col gap-2 border rounded-md p-4 cursor-pointer hover:bg-accent", {
                                    'bg-accent border-primary ring-2 ring-primary': selectedEnvironmentId === 'dev-env'
                                })}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="dev-env" id="dev-env" />
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
                                    'bg-accent border-primary ring-2 ring-primary': selectedEnvironmentId === 'test-env'
                                })}>
                                     <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="test-env" id="test-env" />
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
                return (
                     <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Simulators</h3>
                            {simulators.map((sim, index) => (
                                <Card key={sim.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="grid grid-cols-2 gap-4 flex-1">
                                            <Input placeholder="Name" value={sim.name} onChange={e => updateInstance('simulator', index, 'name', e.target.value)} />
                                            <Input placeholder="IP Address" value={sim.ip} onChange={e => updateInstance('simulator', index, 'ip', e.target.value)} />
                                            <Input placeholder="Username" value={sim.user} onChange={e => updateInstance('simulator', index, 'user', e.target.value)} />
                                            <Input type="password" placeholder="Password" value={sim.pass} onChange={e => updateInstance('simulator', index, 'pass', e.target.value)} />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeInstance('simulator', sim.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                </Card>
                            ))}
                            <Button variant="outline" onClick={() => addInstance('simulator')}><Plus className="mr-2 h-4 w-4"/>Add Simulator</Button>
                        </div>
                         <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Emulators</h3>
                            {emulators.map((em, index) => (
                                <Card key={em.id} className="p-4">
                                     <div className="flex justify-between items-start">
                                        <div className="grid grid-cols-2 gap-4 flex-1">
                                            <Input placeholder="Name" value={em.name} onChange={e => updateInstance('emulator', index, 'name', e.target.value)} />
                                            <Input placeholder="IP Address" value={em.ip} onChange={e => updateInstance('emulator', index, 'ip', e.target.value)} />
                                            <Input placeholder="Username" value={em.user} onChange={e => updateInstance('emulator', index, 'user', e.target.value)} />
                                            <Input type="password" placeholder="Password" value={em.pass} onChange={e => updateInstance('emulator', index, 'pass', e.target.value)} />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeInstance('emulator', em.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                </Card>
                            ))}
                            <Button variant="outline" onClick={() => addInstance('emulator')}><Plus className="mr-2 h-4 w-4"/>Add Emulator</Button>
                        </div>
                    </div>
                );
            case 5:
                 return (
                    <div className="space-y-4 text-sm">
                        <h3 className="font-semibold text-lg">Summary</h3>
                        <p><strong>Project:</strong> {projectName}</p>
                        <p><strong>Dependencies:</strong> {dependencies.length > 0 ? dependencies.map(d => d.name).join(', ') : 'None'}</p>
                        <p><strong>Git Repo:</strong> {repoUrl || 'Not configured'}</p>
                        <p><strong>CI/CD:</strong> {pipelineType || 'Not configured'}</p>
                        <p><strong>Environment:</strong> {selectedEnvironmentId === 'dev-env' ? 'Development' : selectedEnvironmentId === 'test-env' ? 'Test' : 'Not Selected'}</p>
                        <p><strong>Simulators:</strong> {simulators.length}</p>
                        <p><strong>Emulators:</strong> {emulators.length}</p>
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
            case 4: return "Configure simulators and emulators for your testing environment.";
            case 5: return "Review all your selections before finishing.";
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
                       {renderStepContent()}
                    </CardContent>
                     <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                         </Button>
                        <div className="flex items-center gap-4">
                            {step === 2 && <Button variant="secondary" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Skip & Download</Button>}
                             {step < 5 ? (
                                <Button onClick={step === 1 ? handleGenerate : handleNext}>
                                    {step === 1 ? 'Generate Project' : 'Next'} <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            ) : (
                                <Button onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4"/> Finish & Download
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}

