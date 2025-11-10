

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbComponent, OnboardingConfiguration, CmdbTenant, CmdbApplication, CmdbInterface } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, ArrowRight, PlusCircle, Trash2 } from 'lucide-react';
import OnboardingStepper from '../../tenants/create/_components/onboarding-stepper';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';

type NewComponentFormState = Partial<Omit<CmdbComponent, '_id' | 'created_at' | 'updated_at' | 'phases'>>;

export default function CreateComponentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState<NewComponentFormState>({ custom_labels: [], tenants: [], dependent_components: [], dependent_applications: [], provided_interfaces: [], dependent_interfaces: [] });
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfiguration | null>(null);
    const [newItem, setNewItem] = useState<CmdbComponent | null>(null);
    
    const [allTenants, setAllTenants] = useState<CmdbTenant[]>([]);
    const [allComponents, setAllComponents] = useState<CmdbComponent[]>([]);
    const [allApplications, setAllApplications] = useState<CmdbApplication[]>([]);
    const [allInterfaces, setAllInterfaces] = useState<CmdbInterface[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchDependencies() {
            setLoading(true);
            try {
                const [tenantRes, configRes, componentsRes, applicationsRes, interfacesRes] = await Promise.all([
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/settings/component-onboarding'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications'),
                    fetch('/api/cmdb/interfaces'),
                ]);

                if (tenantRes.ok) setAllTenants(await tenantRes.json());
                if (componentsRes.ok) setAllComponents(await componentsRes.json());
                if (applicationsRes.ok) setAllApplications(await applicationsRes.json());
                if (interfacesRes.ok) setAllInterfaces(await interfacesRes.json());
                
                if (configRes.ok) {
                    const configs = await configRes.json();
                    if (configs && configs.length > 0) {
                        setOnboardingConfig(configs.reduce((latest: OnboardingConfiguration, current: OnboardingConfiguration) => current.version > latest.version ? current : latest, configs[0]));
                    }
                } else {
                     toast({ variant: 'destructive', title: 'Error', description: 'Failed to load onboarding configuration.' });
                }
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not load required data.' });
            } finally {
                setLoading(false);
            }
        }
        fetchDependencies();
    }, [toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        const key = id.split('_')[1];
         if (id.startsWith('resources_')) {
            setFormState(prev => ({ ...prev, resources: { ...prev.resources, [key]: type === 'number' ? Number(value) : value } as any }));
        } else {
             setFormState(prev => ({ ...prev, [id]: value }));
        }
    };
    
     const handleMultiSelectChange = (field: 'tenants' | 'dependent_components' | 'dependent_applications' | 'provided_interfaces' | 'dependent_interfaces', selectedItems: { id: string; name: string }[]) => {
        setFormState(prev => ({ ...prev, [field]: selectedItems }));
    };
    
    const handleCustomLabelChange = (index: number, key: 'key' | 'value', value: string) => {
        const updatedLabels = [...(formState.custom_labels || [])];
        updatedLabels[index] = { ...updatedLabels[index], [key]: value };
        setFormState(prev => ({ ...prev, custom_labels: updatedLabels }));
    };

    const addCustomLabel = () => {
        setFormState(prev => ({ ...prev, custom_labels: [...(prev.custom_labels || []), { key: '', value: '' }] }));
    };
    
    const removeCustomLabel = (index: number) => {
        setFormState(prev => ({ ...prev, custom_labels: (formState.custom_labels || []).filter((_, i) => i !== index) }));
    };


    const handleFirstStepSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onboardingConfig) {
            toast({ variant: 'destructive', title: 'Error', description: 'Onboarding configuration not loaded.' });
            return;
        }

        setLoading(true);
        const payload = {
            ...formState,
            id: formState.name?.replace(/\s+/g, '_') || `item-${Date.now()}`,
            phases: onboardingConfig.phases.map(phase => ({
                id: phase.id, name: phase.name, version: "1.0", status: "Not Started",
                fields: phase.fields.map(field => ({ name: field.name, value: "", proof: {} }))
            })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            const response = await fetch('/api/cmdb/components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const createdItem = await response.json();
                setNewItem(createdItem);
                toast({ title: 'Success', description: 'Component created. Proceeding to onboarding.' });
                setStep(2);
            } else {
                const errorData = await response.json();
                toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to create component.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };
    
    const renderMultiSelect = (
        fieldName: 'tenants' | 'dependent_components' | 'dependent_applications' | 'provided_interfaces' | 'dependent_interfaces',
        allOptions: Option[]
    ) => {
        const chosenItems = (formState[fieldName] || []) as { id: string; name: string; }[];
        const chosenIds = new Set(chosenItems.map(item => item.id));

        const available: Option[] = allOptions.filter(opt => !chosenIds.has(opt.id));
        const chosen: Option[] = chosenItems.map(item => ({ id: item.id, label: item.name }));
        
        const moveItems = (ids: string[], source: Option[], dest: Option[]) => {
            const itemsToMove = source.filter(item => ids.includes(item.id));
            const newDest = [...dest, ...itemsToMove];
            handleMultiSelectChange(fieldName, newDest.map(i => ({id: i.id, name: i.label})));
        };

        return (
            <MultiSelectListBox
                available={available}
                chosen={chosen}
                onMoveToChosen={(ids) => moveItems(ids, available, chosen)}
                onMoveToAvailable={(ids) => {
                    const newChosen = chosen.filter(item => !ids.includes(item.id));
                    handleMultiSelectChange(fieldName, newChosen.map(i => ({id: i.id, name: i.label})));
                }}
                onMoveAllToChosen={() => handleMultiSelectChange(fieldName, available.map(i => ({id: i.id, name: i.label})))}
                onMoveAllToAvailable={() => handleMultiSelectChange(fieldName, [])}
            />
        );
    };

    if (loading && !onboardingConfig) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    if (step === 2 && onboardingConfig && newItem) {
        return (
            <DashboardLayout user={user}>
                <OnboardingStepper 
                    config={onboardingConfig} 
                    tenant={newItem as any}
                    entityType="component"
                />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleFirstStepSubmit}>
                    <Card className="max-w-4xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl">Register New Component</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="version">Version</Label>
                                    <Input id="version" value={formState.version || ''} onChange={handleInputChange} required />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="artifact_location">Artifact Location</Label>
                                    <Input id="artifact_location" value={formState.artifact_location || ''} onChange={handleInputChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="artifact_name">Artifact Name</Label>
                                    <Input id="artifact_name" value={formState.artifact_name || ''} onChange={handleInputChange} />
                                </div>
                             </div>
                            
                            <div className="space-y-2">
                                <Label>Tenants</Label>
                                {renderMultiSelect('tenants', allTenants.map(t => ({ id: t._id, label: t.name })))}
                            </div>

                            <div className="space-y-4">
                                <Label>Resources</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2">
                                         <Label htmlFor="resources_default_instances" className="text-xs">Default Instances</Label>
                                         <Input id="resources_default_instances" type="number" value={formState.resources?.default_instances || '1'} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                         <Label htmlFor="resources_cpu" className="text-xs">CPU</Label>
                                         <Input id="resources_cpu" type="number" placeholder="vCores" value={formState.resources?.cpu || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                         <Label htmlFor="resources_memory" className="text-xs">Memory</Label>
                                         <Input id="resources_memory" type="number" placeholder="GB" value={formState.resources?.memory || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                         <Label htmlFor="resources_storage" className="text-xs">Storage</Label>
                                         <Input id="resources_storage" type="number" placeholder="GB" value={formState.resources?.storage || ''} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Custom Labels</Label>
                                <div className="space-y-2">
                                    {(formState.custom_labels || []).map((label, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input placeholder="Key" value={label.key} onChange={e => handleCustomLabelChange(index, 'key', e.target.value)} />
                                            <Input placeholder="Value" value={label.value} onChange={e => handleCustomLabelChange(index, 'value', e.target.value)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomLabel(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addCustomLabel}><PlusCircle className="mr-2 h-4 w-4" /> Add Label</Button>
                            </div>

                             <div className="space-y-2">
                                <Label>Dependent Components</Label>
                                {renderMultiSelect('dependent_components', allComponents.map(c => ({ id: c._id, label: c.name })))}
                            </div>
                            <div className="space-y-2">
                                <Label>Dependent Applications</Label>
                                {renderMultiSelect('dependent_applications', allApplications.map(a => ({ id: a._id, label: a.name })))}
                            </div>
                            <div className="space-y-2">
                                <Label>Provided Interfaces</Label>
                                {renderMultiSelect('provided_interfaces', allInterfaces.map(i => ({ id: i._id, label: i.name })))}
                            </div>
                            <div className="space-y-2">
                                <Label>Dependent (Required) Interfaces</Label>
                                {renderMultiSelect('dependent_interfaces', allInterfaces.map(i => ({ id: i._id, label: i.name })))}
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-between">
                             <Button variant="outline" type="button" onClick={() => router.back()}>BACK TO LIST</Button>
                             <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                NEXT: ONBOARDING
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
