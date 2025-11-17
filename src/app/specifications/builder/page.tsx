
'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Server, ArrowLeft, ArrowRight, Package, Upload, Copy, Check, FileJson, Cpu, MemoryStick, Database, NetworkIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';


function DiagramDisplay({ specJson }: { specJson: string }) {
    let spec;
    try {
        spec = JSON.parse(specJson);
    } catch (e) {
        return (
            <div className="h-full bg-muted rounded-md flex items-center justify-center p-4">
                <p className="text-destructive">Invalid JSON format</p>
            </div>
        );
    }

    if (spec.hardwareType === 'Blade' || spec.hardwareType === 'Rack' || spec.hardwareType === 'Tower') {
        const isSymmetric = spec.symmetric !== false; // Default to symmetric
        const blades = isSymmetric 
            ? Array.from({ length: spec.bladeCount || 1 }).map((_, i) => ({
                name: `Blade ${i + 1}`,
                cpuType: spec.cpuType,
                memoryPerBlade: spec.memoryPerBlade,
              }))
            : spec.blades || [];

        return (
            <div className="h-full bg-muted rounded-md p-4 space-y-4 overflow-auto">
                <h4 className="font-bold text-center">{spec.name || `${spec.hardwareType} Specification`}</h4>
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-background">
                     <p className="text-sm text-center font-semibold mb-2">{spec.vendor || 'Generic'} Chassis</p>
                     <div className={cn("grid gap-2", {
                         'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': blades.length > 1,
                         'grid-cols-1': blades.length === 1,
                     })}>
                        {blades.map((blade: any, i: number) => (
                             <div key={i} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                                <Server className="mx-auto h-6 w-6 text-gray-500"/>
                                <p className="text-xs font-mono text-center mt-1">{blade.name || `Blade ${i + 1}`}</p>
                                <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                    <div className="flex items-center gap-1"><Cpu className="h-3 w-3"/><span>{blade.cpuType || 'N/A'}</span></div>
                                    <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3"/><span>{blade.memoryPerBlade || 'N/A'} GB</span></div>
                                    <div className="flex items-center gap-1"><Database className="h-3 w-3"/><span>{blade.storageCapacity || spec.storageCapacity || 'N/A'} {isSymmetric ? 'TB' : 'GB'}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-around items-center text-center">
                         <div className="flex flex-col items-center gap-1">
                            <Database className="h-6 w-6 text-gray-600"/>
                            <p className="text-xs">{spec.storageType || 'N/A'} Storage</p>
                            <p className="text-[10px] text-muted-foreground">{spec.storageCapacity || 'N/A'} TB</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <NetworkIcon className="h-6 w-6 text-gray-600"/>
                            <p className="text-xs">{spec.switchType || 'N/A'}</p>
                            <p className="text-[10px] text-muted-foreground">{spec.networkRedundancy || 'N/A'} Redundancy</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (spec.vmSize) {
        const vmCount = spec.vmCount || 1;
        return (
             <div className="h-full bg-muted rounded-md p-4 space-y-4 overflow-auto">
                <h4 className="font-bold text-center">Data Center VM Specification</h4>
                 <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-background">
                    <p className="text-sm text-center font-semibold mb-2">Hypervisor Cluster</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                         {Array.from({ length: vmCount }).map((_, i) => (
                             <div key={i} className="border rounded-md p-2 bg-blue-50 dark:bg-blue-900/30">
                                <Server className="mx-auto h-6 w-6 text-blue-500"/>
                                <p className="text-xs font-mono text-center mt-1">VM {i + 1} ({spec.vmSize})</p>
                                <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                    <div className="flex items-center gap-1"><Cpu className="h-3 w-3"/><span>{spec.cpuPerVm || 'N/A'} cores</span></div>
                                    <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3"/><span>{spec.memoryPerVm || 'N/A'} GB</span></div>
                                    <div className="flex items-center gap-1"><Database className="h-3 w-3"/><span>{spec.diskPerVm || 'N/A'} GB</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-4 flex justify-around items-center text-center">
                         <div className="flex flex-col items-center gap-1">
                            <NetworkIcon className="h-6 w-6 text-gray-600"/>
                            <p className="text-xs">{spec.connectivity || 'N/A'} Connectivity</p>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <Server className="h-6 w-6 text-gray-600"/>
                            <p className="text-xs">{spec.highAvailability || 'N/A'} HA</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Diagram placeholder</p>
        </div>
    );
}

export default function SpecificationBuilderPage() {
    const [user, setUser] = useState<User | null>(null);
    const [builderMode, setBuilderMode] = useState<'hardware' | 'vm' | null>(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [jsonSpec, setJsonSpec] = useState('');


    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const handleModeSelect = (mode: 'hardware' | 'vm') => {
        setBuilderMode(mode);
        setStep(1);
        setFormData(mode === 'hardware' ? { symmetric: true } : {});
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            setBuilderMode(null);
        }
    }
    
    const handleNext = useCallback(() => {
        const nextStep = step + 1;
        const maxSteps = builderMode === 'hardware' ? 5 : 4;
        
        if (nextStep >= maxSteps) { // It's time to generate the JSON
            const specName = `Spec-${builderMode}-${formData.hardwareType || formData.vmSize || 'Custom'}-${Date.now()}`;
            let fullSpec: any = {
                name: specName,
                vendor: 'DefaultVendor', // Default value
                hw_type: { id: builderMode === 'hardware' ? formData.hardwareType : 'Virtual', name: builderMode === 'hardware' ? formData.hardwareType : 'Virtual' },
                hypervisor: { id: '', name: '' },
                service_contract_type: { id: '', name: '' },
                ...formData,
            };
            
            if (builderMode === 'hardware') {
                if (formData.symmetric) {
                    delete fullSpec.blades;
                } else {
                    delete fullSpec.cpuType;
                    delete fullSpec.memoryPerBlade;
                    fullSpec.bladeCount = 1;
                    fullSpec.blades = [{
                        cpuType: "2x Intel Xeon Gold 6248R",
                        memoryPerBlade: 64,
                        storageType: "Local",
                        storageCapacity: 2,
                        networkRedundancy: "Active/Passive"
                    }];
                }
            }
            
            // Remove helper fields from final JSON
            if (fullSpec.symmetric !== undefined) delete fullSpec.symmetric;
            
            setJsonSpec(JSON.stringify(fullSpec, null, 2));
        }

        setStep(nextStep);
    }, [step, builderMode, formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
    };

    const handleRadioChange = (id: string, value: string) => {
        if (id === 'symmetric') {
            setFormData((prev: any) => ({...prev, [id]: value === 'true'}));
        } else {
            setFormData((prev: any) => ({ ...prev, [id]: value }));
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(jsonSpec);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let payload;
        try {
            payload = JSON.parse(jsonSpec);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Invalid JSON', description: 'The JSON in the editor is not valid.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/specifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }),
            });
            if (!response.ok) throw new Error('Failed to save specification.');
            toast({ title: 'Success', description: 'Specification created successfully.' });
            router.push('/specifications');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderInitialSelection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleModeSelect('hardware')}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HardDrive /> Hardware Specification</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Define physical hardware specifications for Rack, Blade, or Tower servers for Air-Gapped and On-Prem environments.</p>
                </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleModeSelect('vm')}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Server /> Data Center VM Specification</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Define virtual machine specifications including size, resources, and connectivity for data center deployments.</p>
                </CardContent>
            </Card>
        </div>
    );

    const renderHardwareSteps = () => {
        const maxSteps = 5;
        switch (step) {
            case 1:
                return (
                     <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>What type of hardware?</Label>
                            <RadioGroup onValueChange={(v) => handleRadioChange('hardwareType', v)} value={formData.hardwareType}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Rack" id="r1" /><Label htmlFor="r1">Rack</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Blade" id="r2" /><Label htmlFor="r2">Blade</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Tower" id="r3" /><Label htmlFor="r3">Tower</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                             <Label>Is the blade configuration symmetric?</Label>
                             <RadioGroup onValueChange={(v) => handleRadioChange('symmetric', v)} value={String(formData.symmetric)}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="sym1" /><Label htmlFor="sym1">Yes, all blades are identical.</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="sym2" /><Label htmlFor="sym2">No, I want to define each blade individually.</Label></div>
                             </RadioGroup>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        {formData.symmetric && (
                            <div><Label htmlFor="bladeCount">How many blades?</Label><Input id="bladeCount" type="number" value={formData.bladeCount || ''} onChange={handleInputChange} /></div>
                        )}
                        <div><Label htmlFor="cpuType">CPU type and count per blade/server</Label><Input id="cpuType" value={formData.cpuType || ''} onChange={handleInputChange} placeholder="e.g., 2x Intel Xeon Gold 6248R"/></div>
                        <div><Label htmlFor="memoryPerBlade">Memory per blade/server (GB)</Label><Input id="memoryPerBlade" type="number" value={formData.memoryPerBlade || ''} onChange={handleInputChange} /></div>
                    </div>
                );
            case 3:
                return (
                     <div className="space-y-4">
                        <div>
                            <Label>Storage type</Label>
                            <RadioGroup onValueChange={(v) => handleRadioChange('storageType', v)} value={formData.storageType}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Centralized" id="s1" /><Label htmlFor="s1">Centralized SAN/NAS</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Local" id="s2" /><Label htmlFor="s2">Blade-local Storage</Label></div>
                            </RadioGroup>
                        </div>
                        <div><Label htmlFor="storageCapacity">Storage capacity (TB)</Label><Input id="storageCapacity" type="number" value={formData.storageCapacity || ''} onChange={handleInputChange} /></div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div><Label htmlFor="switchType">Network switch type</Label><Input id="switchType" value={formData.switchType || ''} onChange={handleInputChange} placeholder="e.g., Cisco Nexus 9000"/></div>
                        <div>
                             <Label>Network Redundancy</Label>
                             <RadioGroup onValueChange={(v) => handleRadioChange('networkRedundancy', v)} value={formData.networkRedundancy}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="None" id="n1" /><Label htmlFor="n1">None</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Active/Passive" id="n2" /><Label htmlFor="n2">Active/Passive</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Active/Active" id="n3" /><Label htmlFor="n3">Active/Active</Label></div>
                            </RadioGroup>
                        </div>
                    </div>
                );
            default:
                 return renderSummaryAndExport();
        }
    };
    
    const renderVmSteps = () => {
         const maxSteps = 4;
         switch (step) {
            case 1:
                return (
                     <div className="space-y-4">
                        <div><Label htmlFor="vmCount">Number of VMs</Label><Input id="vmCount" type="number" value={formData.vmCount || ''} onChange={handleInputChange} /></div>
                        <div>
                            <Label>VM Size</Label>
                            <RadioGroup onValueChange={(v) => handleRadioChange('vmSize', v)} value={formData.vmSize}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Small" id="v1" /><Label htmlFor="v1">Small</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Medium" id="v2" /><Label htmlFor="v2">Medium</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Large" id="v3" /><Label htmlFor="v3">Large</Label></div>
                            </RadioGroup>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-4">
                        <div><Label htmlFor="cpuPerVm">CPU cores per VM</Label><Input id="cpuPerVm" type="number" value={formData.cpuPerVm || ''} onChange={handleInputChange} /></div>
                        <div><Label htmlFor="memoryPerVm">Memory per VM (GB)</Label><Input id="memoryPerVm" type="number" value={formData.memoryPerVm || ''} onChange={handleInputChange} /></div>
                         <div><Label htmlFor="diskPerVm">Disk size per VM (GB)</Label><Input id="diskPerVm" type="number" value={formData.diskPerVm || ''} onChange={handleInputChange} /></div>
                    </div>
                );
            case 3:
                return (
                     <div className="space-y-4">
                        <div>
                             <Label>Connectivity</Label>
                             <RadioGroup onValueChange={(v) => handleRadioChange('connectivity', v)} value={formData.connectivity}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="VLAN" id="c1" /><Label htmlFor="c1">VLAN</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="SDN" id="c2" /><Label htmlFor="c2">SDN</Label></div>
                            </RadioGroup>
                        </div>
                        <div>
                            <Label>High Availability Requirements</Label>
                             <RadioGroup onValueChange={(v) => handleRadioChange('highAvailability', v)} value={formData.highAvailability}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="None" id="h1" /><Label htmlFor="h1">None</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="n+1" id="h2" /><Label htmlFor="h2">n+1</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Full Redundancy" id="h3" /><Label htmlFor="h3">Full Redundancy</Label></div>
                            </RadioGroup>
                        </div>
                    </div>
                );
            default:
                 return renderSummaryAndExport();
        }
    };
    
     const renderSummaryAndExport = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Generated JSON Specification</CardTitle></CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Textarea value={jsonSpec} onChange={(e) => setJsonSpec(e.target.value)} rows={15} className="font-mono text-xs"/>
                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Upload Specification</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">Or, upload an existing specification in the same JSON format.</p>
                        <Input type="file" />
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Visualization</CardTitle></CardHeader>
                    <CardContent className="h-96">
                        <DiagramDisplay specJson={jsonSpec} />
                    </CardContent>
                </Card>
                 <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Package className="h-5 w-5 mr-2" />}
                    Create Specification from JSON
                 </Button>
            </div>
        </div>
    );
    
    const maxSteps = builderMode === 'hardware' ? 5 : 4;


    const renderWizard = () => {
        return (
             <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {builderMode === 'hardware' ? <HardDrive/> : <Server/>}
                        {builderMode === 'hardware' ? 'Hardware' : 'VM'} Specification Builder
                    </CardTitle>
                    <CardDescription>Step {step} of {maxSteps - 1}: {
                        builderMode === 'hardware' ? 
                        ['Hardware Type', 'CPU & Memory', 'Storage', 'Network', 'Summary & Export'][step - 1] :
                        ['VM Sizing', 'Resources', 'Connectivity', 'Summary & Export'][step - 1]
                    }</CardDescription>
                </CardHeader>
                 <CardContent className="min-h-[20rem]">
                    {builderMode === 'hardware' ? renderHardwareSteps() : renderVmSteps()}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                       <ArrowLeft className="mr-2 h-4 w-4" />
                       {step === 1 ? 'Back to Selection' : 'Back'}
                    </Button>
                    {step < maxSteps && (
                        <Button onClick={handleNext}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        )
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                 <div className="mb-8">
                    <h1 className="text-3xl font-bold">Specification Builder</h1>
                    <p className="text-muted-foreground">
                        A guided wizard to define hardware and VM specifications.
                    </p>
                </div>
                
                 {builderMode ? renderWizard() : renderInitialSelection()}
            </main>
        </DashboardLayout>
    );
}
