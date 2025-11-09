
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
import type { User, CmdbApplication, OnboardingConfiguration, CmdbTenant } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, ArrowRight, PlusCircle, Trash2, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OnboardingPhaseComponent from '../../../tenants/create/_components/onboarding-phase';

type EditApplicationFormState = Partial<Omit<CmdbApplication, '_id' | 'created_at' | 'updated_at'>> & { updateComment?: string };

const statusColors: Record<string, string> = {
    'Not Started': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Done': 'bg-green-200 text-green-800',
    'Cancelled': 'bg-red-200 text-red-800',
    'Skipped': 'bg-yellow-200 text-yellow-800',
};

export default function EditApplicationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<EditApplicationFormState>({});
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfiguration | null>(null);
    const [allTenants, setAllTenants] = useState<CmdbTenant[]>([]);
    
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});


    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        setLoading(true);
        async function fetchData() {
            try {
                const [applicationRes, configRes, tenantsRes] = await Promise.all([
                    fetch(`/api/cmdb/applications/${id}`),
                    fetch('/api/settings/application-onboarding'),
                    fetch('/api/cmdb/tenants'),
                ]);

                if (!applicationRes.ok) throw new Error('Failed to fetch application');
                const applicationData = await applicationRes.json();
                setFormState(applicationData);

                const initialPhasesState: Record<string, any> = {};
                (applicationData.phases || []).forEach((phase: any) => {
                    initialPhasesState[phase.id] = { status: phase.status };
                    phase.fields.forEach((field: any) => {
                        initialPhasesState[phase.id][field.name] = { value: field.value, proofLink: field.proof?.link };
                    });
                });
                setPhasesState(initialPhasesState);
                
                if (configRes.ok) {
                    const configs = await configRes.json();
                    if (configs && configs.length > 0) {
                        setOnboardingConfig(configs.reduce((latest: any, current: any) => current.version > latest.version ? current : latest, configs[0]));
                    }
                }
                if (tenantsRes.ok) setAllTenants(await tenantsRes.json());
                
            } catch(err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err.message });
                router.push('/cmdb/applications');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        const key = id.split('_')[1];
         if (id.startsWith('resources_')) {
            setFormState(prev => ({ ...prev, resources: { ...prev.resources, [key]: type === 'number' ? Number(value) : value } as any }));
        } else {
             setFormState(prev => ({ ...prev, [id]: value }));
        }
    };
    
    const handleSelectChange = (field: 'type' | 'tenants', value: string) => {
        if (field === 'tenants') {
            const selectedTenant = allTenants.find(t => t._id === value);
            if (selectedTenant) {
                 setFormState(prev => ({ ...prev, tenants: [{ id: selectedTenant._id, name: selectedTenant.name }] }));
            }
        } else {
             setFormState(prev => ({ ...prev, [field]: value as 'component' | 'application' }));
        }
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

    const handlePhaseStateChange = (phaseId: string, fieldName: string, value: any) => {
        setPhasesState(prev => ({
            ...prev,
            [phaseId]: { ...prev[phaseId], [fieldName]: value }
        }));
    };

    const handleStatusChange = (phaseId: string, status: string) => {
         setPhasesState(prev => ({
            ...prev,
            [phaseId]: { ...prev[phaseId], status }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required.' });
            return;
        }

        setLoading(true);

        const applicationPhases = (formState.phases || []).map(phaseConfig => {
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
            const payload = { ...formState, phases: applicationPhases };
            const response = await fetch(`/api/cmdb/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update application');
            }
            toast({ title: 'Success', description: 'Application updated successfully.' });
            router.push('/cmdb/applications');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
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
                            <CardTitle>Update Application: {formState.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                     <Select value={formState.type} onValueChange={(value) => handleSelectChange('type', value)} required disabled>
                                        <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="component">Component</SelectItem>
                                            <SelectItem value="application">Application</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tenants">Tenants</Label>
                                    <Select value={formState.tenants?.[0]?.id} onValueChange={(value) => handleSelectChange('tenants', value)} required>
                                        <SelectTrigger><SelectValue placeholder="Select tenant..." /></SelectTrigger>
                                        <SelectContent>
                                            {allTenants.map(tenant => (
                                                <SelectItem key={tenant._id} value={tenant._id}>{tenant.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="version">Version</Label>
                                    <Input id="version" value={formState.version || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artifact_location">Artifact Location</Label>
                                    <Input id="artifact_location" value={formState.artifact_location || ''} onChange={handleInputChange} />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="artifact_name">Artifact Name</Label>
                                <Input id="artifact_name" value={formState.artifact_name || ''} onChange={handleInputChange} />
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
                        </CardContent>
                    </Card>

                    {onboardingConfig && formState.phases && (
                         <Card className="max-w-4xl mx-auto mt-8">
                            <CardHeader>
                                <CardTitle>Onboarding Phases</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <div className="relative flex flex-wrap items-center p-4 gap-y-8 gap-x-4">
                                    {formState.phases.map((phase, index) => (
                                        <div key={phase.id} className="flex items-center">
                                            <OnboardingPhaseComponent
                                                phase={onboardingConfig.phases.find(p => p.id === phase.id)!}
                                                phaseState={phasesState[phase.id] || {}}
                                                onStateChange={(fieldName, value) => handlePhaseStateChange(phase.id, fieldName, value)}
                                                onStatusChange={(status) => handleStatusChange(phase.id, status)}
                                                isExpanded={expandedPhase === phase.id}
                                                onExpand={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                                                statusColor={statusColors[phasesState[phase.id]?.status] || 'bg-gray-200 text-gray-800'}
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
                                        onClick={() => setExpandedPhase(null)}
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
                                        UPDATE APPLICATION
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
