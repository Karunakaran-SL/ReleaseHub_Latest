
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
import type { User, CmdbTenant, OnboardingConfiguration, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, ArrowRight, UploadCloud } from 'lucide-react';
import OnboardingStepper from './_components/onboarding-stepper';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';

type NewTenantFormState = Partial<Omit<CmdbTenant, '_id' | 'created_at' | 'updated_at' | 'phases'>>;

export default function CreateTenantPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState<NewTenantFormState>({});
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfiguration | null>(null);
    const [newTenant, setNewTenant] = useState<CmdbTenant | null>(null);
    
    const [allTenants, setAllTenants] = useState<CmdbTenant[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchDependencies() {
            setLoading(true);
            try {
                const [tenantRes, productRes, configRes] = await Promise.all([
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/products'),
                    fetch('/api/settings/tenant-onboarding')
                ]);

                if (tenantRes.ok) setAllTenants(await tenantRes.json());
                if (productRes.ok) setAllProducts(await productRes.json());
                
                if (configRes.ok) {
                    const configs = await configRes.json();
                    if (configs && configs.length > 0) {
                        const latestConfig = configs.reduce((latest: OnboardingConfiguration, current: OnboardingConfiguration) => 
                            current.version > latest.version ? current : latest
                        , configs[0]);
                        setOnboardingConfig(latestConfig);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        if (id.startsWith('resources_')) {
            const resourceKey = id.replace('resources_', '');
            setFormState(prev => ({
                ...prev,
                resources: {
                    ...prev.resources,
                    [resourceKey]: type === 'number' ? Number(value) : value
                }
            }));
        } else {
             setFormState(prev => ({ ...prev, [id]: type === 'number' ? Number(value) : value }));
        }
    };
    
    const handleMultiSelectChange = (field: 'dependent_tenants' | 'products', selectedItems: { id: string; name: string }[]) => {
        setFormState(prev => ({ ...prev, [field]: selectedItems }));
    };

    const handleFirstStepSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onboardingConfig) {
            toast({ variant: 'destructive', title: 'Error', description: 'Onboarding configuration not loaded. Cannot create tenant.' });
            return;
        }

        setLoading(true);
        
        const phases = onboardingConfig.phases.map(phase => ({
            id: phase.id,
            name: phase.name,
            version: "1.0", // Or from config version
            status: "Not Started",
            fields: phase.fields.map(field => ({
                name: field.name,
                value: "",
                proof: {}
            }))
        }));

        const tenantId = formState.name?.replace(/\s+/g, '_') || `Tenant_${Date.now()}`;
        const payload = {
            ...formState,
            _id: tenantId,
            phases: phases,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        try {
            const response = await fetch('/api/cmdb/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const createdTenant = await response.json();
                setNewTenant(createdTenant);
                toast({ title: 'Success', description: 'Tenant created. Proceeding to onboarding.' });
                setStep(2);
            } else {
                const errorData = await response.json();
                toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to create tenant.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const renderMultiSelect = (
        fieldName: 'dependent_tenants' | 'products',
        allOptions: Option[]
    ) => {
        const chosenItems = (formState[fieldName] || []) as { id: string; name: string; }[];
        const chosenIds = new Set(chosenItems.map(item => item.id));

        const available: Option[] = allOptions
            .filter(opt => !chosenIds.has(opt.id))
            .map(opt => ({ id: opt.id, label: opt.label }));

        const chosen: Option[] = chosenItems.map(item => ({ id: item.id, label: item.name }));

        const moveItems = (ids: string[], source: Option[], dest: Option[]) => {
            const itemsToMove = source.filter(item => ids.includes(item.id));
            const newDest = [...dest, ...itemsToMove];
            handleMultiSelectChange(fieldName, newDest.map(i => ({id: i.id, name: i.label})));
        };
        
        const moveAll = (source: Option[], dest: Option[]) => {
            const newDest = [...dest, ...source];
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
                onMoveAllToChosen={() => moveAll(available, chosen)}
                onMoveAllToAvailable={() => handleMultiSelectChange(fieldName, [])}
            />
        );
    };

    if (loading && !onboardingConfig) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    if (step === 2 && onboardingConfig && newTenant) {
        return (
            <DashboardLayout user={user}>
                <OnboardingStepper 
                    config={onboardingConfig} 
                    tenant={newTenant} 
                    entityType="tenant"
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
                            <CardTitle className="text-2xl">Register New Tenant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name of the Tenant</Label>
                                <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="_id">Tenant ID</Label>
                                <Input id="_id" value={formState._id || ''} onChange={handleInputChange} required />
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
                        <CardFooter className="flex justify-start">
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
