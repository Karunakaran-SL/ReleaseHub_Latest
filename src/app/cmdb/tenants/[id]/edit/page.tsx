
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbTenant, Product, OnboardingConfiguration } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, UploadCloud, ChevronRight } from 'lucide-react';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';
import OnboardingPhaseComponent from '../../create/_components/onboarding-phase';
import { cn } from '@/lib/utils';

type EditTenantFormState = Partial<Omit<CmdbTenant, '_id' | 'created_at' | 'updated_at'>> & { updateComment?: string };

const statusColors: Record<string, string> = {
    'Not Started': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Done': 'bg-green-200 text-green-800',
    'Cancelled': 'bg-red-200 text-red-800',
    'Skipped': 'bg-yellow-200 text-yellow-800',
};


export default function EditTenantPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<EditTenantFormState>({});
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [allTenants, setAllTenants] = useState<CmdbTenant[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfiguration | null>(null);

    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});


    const fetchAndSetData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [tenantRes, allTenantsRes, allProductsRes, configRes] = await Promise.all([
                fetch(`/api/cmdb/tenants/${id}`),
                fetch('/api/cmdb/tenants'),
                fetch('/api/products'),
                fetch('/api/settings/tenant-onboarding')
            ]);

            if (!tenantRes.ok) throw new Error('Failed to fetch tenant data');
            
            const tenantData: CmdbTenant = await tenantRes.json();
            setFormState(tenantData);

            // Initialize phases state for editing
             const initialPhasesState: Record<string, any> = {};
            (tenantData.phases || []).forEach(phase => {
                initialPhasesState[phase.id] = { status: phase.status };
                phase.fields.forEach(field => {
                    initialPhasesState[phase.id][field.name] = { value: field.value, proofLink: field.proof?.link };
                });
            });
            setPhasesState(initialPhasesState);


            if (allTenantsRes.ok) setAllTenants(await allTenantsRes.json());
            if (allProductsRes.ok) setAllProducts(await allProductsRes.json());
            if (configRes.ok) {
                const configs = await configRes.json();
                if (configs && configs.length > 0) {
                    setOnboardingConfig(configs.reduce((latest: any, current: any) => current.version > latest.version ? current : latest, configs[0]));
                }
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to load data: ${error.message}` });
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        getUser().then(setUser);
        fetchAndSetData();
    }, [fetchAndSetData]);

    const handlePhaseStateChange = (phaseId: string, fieldName: string, value: any) => {
        setPhasesState(prev => ({
            ...prev,
            [phaseId]: {
                ...prev[phaseId],
                [fieldName]: value
            }
        }));
    };

    const handleStatusChange = (phaseId: string, status: string) => {
         setPhasesState(prev => ({
            ...prev,
            [phaseId]: { ...prev[phaseId], status }
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        if (id.startsWith('resources_')) {
            const resourceKey = id.replace('resources_', '');
            setFormState(prev => ({
                ...prev,
                resources: {
                    ...prev.resources,
                    [resourceKey]: type === 'number' ? Number(value) : value
                } as any
            }));
        } else {
             setFormState(prev => ({ ...prev, [id]: type === 'number' ? Number(value) : value }));
        }
    };
    
    const handleMultiSelectChange = (field: 'dependent_tenants' | 'products', selectedItems: { id: string; name: string }[]) => {
        setFormState(prev => ({ ...prev, [field]: selectedItems }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required.' });
            return;
        }

        setLoading(true);

        const tenantPhases = (formState.phases || []).map(phaseConfig => {
            const phaseData = phasesState[phaseConfig.id];
            return {
                id: phaseConfig.id,
                name: phaseConfig.name,
                version: phaseConfig.version,
                status: phaseData.status || "Not Started",
                fields: phaseConfig.fields.map(fieldConfig => {
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
            const payload = { ...formState, phases: tenantPhases };
            const response = await fetch(`/api/cmdb/tenants/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update tenant');
            }
            toast({ title: 'Success', description: 'Tenant updated successfully.' });
            router.push(`/cmdb/tenants/${id}/view`);
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderMultiSelect = (
        fieldName: 'dependent_tenants' | 'products',
        allOptions: Option[]
    ) => {
        const currentItemAndSelfFilteredOptions = allOptions.filter(opt => opt.id !== formState._id);
        const chosenItems = (formState[fieldName] || []) as { id: string; name: string; }[];
        const chosenIds = new Set(chosenItems.map(item => item.id));

        const available: Option[] = currentItemAndSelfFilteredOptions
            .filter(opt => !chosenIds.has(opt.id))
            .map(opt => ({ id: opt.id, label: opt.label }));

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

    if (loading) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card className="max-w-4xl mx-auto mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">Update Tenant: {formState.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name of the Tenant</Label>
                                <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="id">Tenant ID</Label>
                                <Input id="id" value={formState.id || ''} onChange={handleInputChange} required disabled/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={formState.description || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label>Image</Label>
                                <Button variant="outline" type="button"><UploadCloud className="mr-2 h-4 w-4"/> UPLOAD IMAGE</Button>
                             </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="version">Version</Label>
                                    <Input id="version" value={formState.version || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artifact_location">Artifact/Package Location</Label>
                                    <Input id="artifact_location" value={formState.artifact_location || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dependent_tenants">Dependent Tenants</Label>
                                    {renderMultiSelect('dependent_tenants', allTenants.map(t => ({id: t._id, label: t.name})))}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="products">Products</Label>
                                    {renderMultiSelect('products', allProducts.map(p => ({id: p._id, label: p.name})))}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Resources</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="resources_cpu">CPU (vCores)</Label>
                                        <Input id="resources_cpu" type="number" value={formState.resources?.cpu || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="resources_memory_gb">Memory (GB)</Label>
                                        <Input id="resources_memory_gb" type="number" value={formState.resources?.memory_gb || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="resources_storage_gb">Storage (GB)</Label>
                                        <Input id="resources_storage_gb" type="number" value={formState.resources?.storage_gb || ''} onChange={handleInputChange} />
                                    </div>
                                </div>
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
                                        UPDATE TENANT
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

    