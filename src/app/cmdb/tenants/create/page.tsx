
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type NewTenantFormState = Partial<Omit<CmdbTenant, '_id' | 'onboarding_status'>> & {
    version?: string;
    artifact_location?: string;
    dependent_tenants?: string[];
    products?: string[];
    resources_cpu?: number;
    resources_memory_gb?: number;
    resources_storage_gb?: number;
};

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
                    const latestConfig = configs.reduce((latest: OnboardingConfiguration, current: OnboardingConfiguration) => 
                        current.version > latest.version ? current : latest
                    , configs[0]);
                    setOnboardingConfig(latestConfig);
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
        setFormState(prev => ({ ...prev, [id]: type === 'number' ? Number(value) : value }));
    };
    
    const handleSelectChange = (field: 'dependent_tenants' | 'products', value: string) => {
        setFormState(prev => ({...prev, [field]: [value]}));
    }

    const handleFirstStepSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/cmdb/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
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
    
    if (step === 2 && onboardingConfig && newTenant) {
        return (
            <DashboardLayout user={user}>
                <OnboardingStepper 
                    config={onboardingConfig} 
                    entityId={newTenant._id} 
                    entityType="tenant"
                    entityName={newTenant.name}
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
                                <Label htmlFor="id">Tenant ID</Label>
                                <Input id="id" value={formState.id || ''} onChange={handleInputChange} required />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dependent_tenants">Dependent Tenants</Label>
                                    <Select onValueChange={(value) => handleSelectChange('dependent_tenants', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select dependent tenants" /></SelectTrigger>
                                        <SelectContent>
                                            {allTenants.map(tenant => (
                                                <SelectItem key={tenant._id} value={tenant._id}>{tenant.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="products">Products</Label>
                                    <Select onValueChange={(value) => handleSelectChange('products', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select products" /></SelectTrigger>
                                        <SelectContent>
                                            {allProducts.map(product => (
                                                <SelectItem key={product._id} value={product._id}>{product.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Resources</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="resources_cpu">CPU (vCores)</Label>
                                        <Input id="resources_cpu" type="number" value={formState.resources_cpu || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="resources_memory_gb">Memory (GB)</Label>
                                        <Input id="resources_memory_gb" type="number" value={formState.resources_memory_gb || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="resources_storage_gb">Storage (GB)</Label>
                                        <Input id="resources_storage_gb" type="number" value={formState.resources_storage_gb || ''} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-start">
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                SUBMIT
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
