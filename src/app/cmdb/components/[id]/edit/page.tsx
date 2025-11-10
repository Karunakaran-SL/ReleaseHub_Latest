

'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbComponent, OnboardingConfiguration, CmdbTenant, CmdbApplication, CmdbInterface } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, PlusCircle, Trash2, ChevronRight } from 'lucide-react';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';
import OnboardingPhaseComponent from '../../../tenants/create/_components/onboarding-phase';
import { cn } from '@/lib/utils';

type EditComponentFormState = Partial<Omit<CmdbComponent, '_id' | 'created_at' | 'updated_at'>> & { updateComment?: string };

const statusColors: Record<string, string> = {
    'Not Started': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Done': 'bg-green-200 text-green-800',
    'Cancelled': 'bg-red-200 text-red-800',
    'Skipped': 'bg-yellow-200 text-yellow-800',
};

export default function EditComponentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<EditComponentFormState>({});
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfiguration | null>(null);
    const [allTenants, setAllTenants] = useState<CmdbTenant[]>([]);
    const [allComponents, setAllComponents] = useState<CmdbComponent[]>([]);
    const [allApplications, setAllApplications] = useState<CmdbApplication[]>([]);
    const [allInterfaces, setAllInterfaces] = useState<CmdbInterface[]>([]);
    
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});
    const [initialPhasesState, setInitialPhasesState] = useState<Record<string, any>>({});
    const [dirtyPhases, setDirtyPhases] = useState<Set<string>>(new Set());
    const [popupState, setPopupState] = useState<any>(null);


    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        setLoading(true);
        async function fetchData() {
            try {
                const [componentRes, configRes, tenantsRes, componentsRes, applicationsRes, interfacesRes] = await Promise.all([
                    fetch(`/api/cmdb/components/${id}`),
                    fetch('/api/settings/component-onboarding'),
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications'),
                    fetch('/api/cmdb/interfaces'),
                ]);

                if (!componentRes.ok) throw new Error('Failed to fetch component');
                const componentData = await componentRes.json();
                setFormState(componentData);

                const initialPhasesData: Record<string, any> = {};
                (componentData.phases || []).forEach((phase: any) => {
                    initialPhasesData[phase.id] = { status: phase.status };
                    phase.fields.forEach((field: any) => {
                        initialPhasesData[phase.id][field.name] = { value: field.value, proofLink: field.proof?.link };
                    });
                });
                setPhasesState(initialPhasesData);
                setInitialPhasesState(JSON.parse(JSON.stringify(initialPhasesData)));
                
                if (configRes.ok) {
                    const configs = await configRes.json();
                    if (configs && configs.length > 0) {
                        setOnboardingConfig(configs.reduce((latest: any, current: any) => current.version > latest.version ? current : latest, configs[0]));
                    }
                }
                if (tenantsRes.ok) setAllTenants(await tenantsRes.json());
                if (componentsRes.ok) setAllComponents(await componentsRes.json());
                if (applicationsRes.ok) setAllApplications(await applicationsRes.json());
                if (interfacesRes.ok) setAllInterfaces(await interfacesRes.json());
                
            } catch(err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err.message });
                router.push('/cmdb/components');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, router, toast]);

    const handleExpandPhase = (phaseId: string) => {
        setExpandedPhase(phaseId);
        setPopupState(JSON.parse(JSON.stringify(phasesState[phaseId])));
    };

    const handleCancelPopup = () => {
        setExpandedPhase(null);
        setPopupState(null);
    };

    const handleSavePopup = () => {
        if (expandedPhase && popupState) {
            setPhasesState(prev => ({ ...prev, [expandedPhase]: popupState }));
             const originalPhaseState = JSON.stringify(initialPhasesState[expandedPhase]);
            const currentPhaseState = JSON.stringify(popupState);
            if (originalPhaseState !== currentPhaseState) {
                setDirtyPhases(prev => new Set(prev).add(expandedPhase));
            } else {
                setDirtyPhases(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(expandedPhase);
                    return newSet;
                });
            }
        }
        handleCancelPopup();
    };

    const handlePopupStateChange = (fieldName: string, value: any) => {
        setPopupState((prev: any) => ({ ...prev, [fieldName]: value }));
    };
    
    const handlePopupStatusChange = (status: string) => {
        setPopupState((prev: any) => ({ ...prev, status }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required.' });
            return;
        }

        setLoading(true);

        const componentPhases = (formState.phases || []).map(phaseConfig => {
            const phaseData = phasesState[phaseConfig.id];
            return {
                id: phaseConfig.id,
                name: phaseConfig.name,
                version: phaseConfig.version,
                status: phaseData.status || "Not Started",
                fields: phaseConfig.fields.map((fieldConfig: any) => {
                    const fieldData = phaseData[fieldConfig.name];
                    return {
                        name: fieldConfig.name,
                        value: fieldData?.value ?? '',
                        proof: { link: fieldData?.proofLink || '' },
                    };
                }),
            };
        });
        
        try {
            const payload = { ...formState, phases: componentPhases };
            const response = await fetch(`/api/cmdb/components/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update component');
            }
            toast({ title: 'Success', description: 'Component updated successfully.' });
            router.push('/cmdb/components');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
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
                    handleMultiSelectChange(fieldName, newChosen.map(i => ({id: i.id, name: i.label})))
                }}
                onMoveAllToChosen={() => handleMultiSelectChange(fieldName, available.map(i => ({id: i.id, name: i.label})))}
                onMoveAllToAvailable={() => handleMultiSelectChange(fieldName, [])}
            />
        );
    };

    if (loading || !formState.id) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card className="max-w-4xl mx-auto mb-8">
                        <CardHeader>
                            <CardTitle>Update Component: {formState.name}</CardTitle>
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
                    </Card>

                    {onboardingConfig && formState.phases && (
                         <Card className="max-w-4xl mx-auto mt-8">
                            <CardHeader>
                                <CardTitle>Onboarding Phases</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <div className={cn("relative flex flex-wrap items-center p-4 gap-y-8 gap-x-4", expandedPhase && 'z-30')}>
                                    {formState.phases.map((phase, index) => (
                                        <div key={phase.id} className="flex items-center">
                                            <OnboardingPhaseComponent
                                                phase={onboardingConfig.phases.find(p => p.id === phase.id)!}
                                                phaseState={expandedPhase === phase.id ? popupState : phasesState[phase.id]}
                                                onStateChange={handlePopupStateChange}
                                                onStatusChange={handlePopupStatusChange}
                                                isExpanded={expandedPhase === phase.id}
                                                onExpand={() => handleExpandPhase(phase.id)}
                                                statusColor={statusColors[phasesState[phase.id]?.status] || 'bg-gray-200 text-gray-800'}
                                                isDirty={dirtyPhases.has(phase.id)}
                                                onSave={handleSavePopup}
                                                onCancel={handleCancelPopup}
                                            />
                                            {index < (formState.phases?.length || 0) - 1 && (
                                                <ChevronRight className="h-8 w-8 text-muted-foreground mx-4" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {expandedPhase && (
                                    <div 
                                        className="fixed inset-0 bg-black/30 z-10" 
                                        onClick={handleCancelPopup}
                                    />
                                )}
                            </CardContent>
                             <CardFooter className="flex flex-col items-start gap-4">
                                <div className="space-y-2 w-full">
                                    <Label htmlFor="updateComment">Update Reason *</Label>
                                    <Textarea
                                        id="updateComment"
                                        placeholder="Provide a reason for this update for auditing purposes."
                                        value={formState.updateComment || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 w-full">
                                    <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                                    <Button type="submit" disabled={loading || !formState.updateComment}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        UPDATE COMPONENT
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    )}
                </form>
            </main>
        </DashboardLayout>
    );
}
