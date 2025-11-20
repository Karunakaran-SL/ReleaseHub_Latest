
'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, DevelopmentEnvironment, Product, Specification, Baseline, CmdbTenant } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectListBox, type Option as MultiSelectOption } from '@/components/ui/multi-select-list-box';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type EditEnvironmentState = Partial<Omit<DevelopmentEnvironment, '_id' | 'createdAt' | 'createdBy'>> & {
    productName?: string;
    specName?: string;
    selectionMode?: 'baseline' | 'manual';
};

export default function EditDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1);
    
    const [formState, setFormState] = useState<EditEnvironmentState>({});

    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchAllData() {
            setLoading(true);
            try {
                const [envRes, productsRes, specsRes, baselinesRes, tenantsRes] = await Promise.all([
                    fetch(`/api/development-environments/${id}`),
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/baselines'),
                    fetch('/api/cmdb/tenants'),
                ]);

                if (!envRes.ok) throw new Error('Failed to fetch environment details.');
                const envData: DevelopmentEnvironment = await envRes.json();
                
                const productsData = await productsRes.json();
                const specsData = await specsRes.json();
                const baselinesData = await baselinesRes.json();
                const tenantsData = await tenantsRes.json();

                setProducts(productsData);
                setSpecifications(specsData);
                setBaselines(baselinesData);
                setTenants(tenantsData);

                const productName = productsData.find((p: Product) => p._id === envData.productId)?.name;
                const specName = specsData.find((s: Specification) => s._id === envData.specificationId)?.name;
                
                setFormState({
                    ...envData,
                    productName,
                    specName,
                    selectionMode: envData.baselineId ? 'baseline' : 'manual'
                });

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
                router.push('/platform-engineering/development-environments');
            } finally {
                setLoading(false);
            }
        }
        fetchAllData();
    }, [id, toast, router]);
    
    const handleUpdate = (data: Partial<EditEnvironmentState>) => {
        setFormState(prev => ({ ...prev, ...data }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { productName, specName, selectionMode, ...payload } = formState;

            if (selectionMode === 'baseline') {
                payload.tenantIds = [];
            } else {
                payload.baselineId = undefined;
            }

            const res = await fetch(`/api/development-environments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update environment.');
            toast({ title: 'Success', description: 'Environment updated successfully.' });
            router.push(`/platform-engineering/development-environments/${id}/view`);
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    
     const isNextDisabled = (): boolean => {
        switch (step) {
            case 1: return !formState.name || !formState.productId || !formState.specificationId;
            case 2:
                if (!formState.selectionMode) return true;
                if (formState.selectionMode === 'baseline' && !formState.baselineId) return true;
                if (formState.selectionMode === 'manual' && (!formState.tenantIds || formState.tenantIds.length === 0)) return true;
                return false;
            default: return false;
        }
    };
    
    const summaryItems = useMemo(() => {
        if (!formState) return [];
        let items: any[] = [];
        if (formState.selectionMode === 'baseline') {
            const baseline = baselines.find(b => b._id === formState.baselineId);
            if (baseline) {
                items = (baseline.tenants || []).flatMap((tenant: any) => [
                    { type: 'Tenant', ...tenant },
                    ...(tenant.components || []).map((c: any) => ({ type: 'Component', ...c })),
                    ...(tenant.applications || []).map((a: any) => ({ type: 'Application', ...a }))
                ]);
            }
        } else {
             items = tenants.filter(t => formState.tenantIds?.includes(t.id)).map(t => ({type: 'Tenant', ...t}));
        }
        
        const uniqueItems = new Map();
        items.forEach(item => {
            if (!item || !item.type || !item.id) return;
            const key = `${item.type}-${item.id}`;
            if (!uniqueItems.has(key)) {
                uniqueItems.set(key, item);
            }
        });
        return Array.from(uniqueItems.values());
    }, [formState, baselines, tenants]);
    
    const renderStepContent = () => {
        if (loading || Object.keys(formState).length === 0) {
            return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }

        switch(step) {
            case 1:
                 return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <Label htmlFor="env-name">Environment Name *</Label>
                             <Input id="env-name" value={formState.name || ''} onChange={(e) => handleUpdate({ name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Product *</Label>
                            <Input value={formState.productName || formState.productId} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label>Specification *</Label>
                            <Input value={formState.specName || formState.specificationId} disabled />
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-6">
                        <RadioGroup value={formState.selectionMode} onValueChange={(v) => handleUpdate({ selectionMode: v as 'baseline' | 'manual', baselineId: undefined, tenantIds: [] })}>
                             <div className="flex items-center space-x-2"><RadioGroupItem value="baseline" id="mode-baseline"/><Label htmlFor="mode-baseline">Use a Baseline</Label></div>
                             <div className="flex items-center space-x-2"><RadioGroupItem value="manual" id="mode-manual"/><Label htmlFor="mode-manual">Select Tenants Manually</Label></div>
                        </RadioGroup>
                        <Separator />
                        {formState.selectionMode === 'baseline' && (
                             <div className="space-y-2">
                                <Label htmlFor="baseline-select">Baseline</Label>
                                <Select value={formState.baselineId} onValueChange={(v) => handleUpdate({ baselineId: v })}>
                                    <SelectTrigger id="baseline-select"><SelectValue placeholder="Select a baseline..." /></SelectTrigger>
                                    <SelectContent>
                                        {baselines.filter(b => b.product.id === formState.productId && b.status === 'RELEASED').map(b => (
                                            <SelectItem key={b._id} value={b._id}>{b.product.name} v{b.product.version}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                         {formState.selectionMode === 'manual' && (
                             <div className="space-y-2">
                                <Label>Tenants</Label>
                                <MultiSelectListBox
                                    available={tenants.filter(t => !(formState.tenantIds || []).includes(t.id)).map(t => ({id: t.id, label: t.name}))}
                                    chosen={(formState.tenantIds || []).map(id => {
                                        const tenant = tenants.find(t => t.id === id);
                                        return { id: id, label: tenant?.name || id };
                                    })}
                                    onMoveToChosen={(ids) => handleUpdate({ tenantIds: [...(formState.tenantIds || []), ...ids] })}
                                    onMoveToAvailable={(ids) => handleUpdate({ tenantIds: (formState.tenantIds || []).filter(id => !ids.includes(id))})}
                                    onMoveAllToChosen={() => handleUpdate({ tenantIds: tenants.map(t => t.id) })}
                                    onMoveAllToAvailable={() => handleUpdate({ tenantIds: [] })}
                                />
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Dependency Summary</h3>
                        <p className="text-sm text-muted-foreground mb-4">The following will be included in the updated environment.</p>
                        <Card>
                             <Table>
                                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Version</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {summaryItems.length > 0 ? summaryItems.map(item => (
                                         <TableRow key={`${item.type}-${item.id}`}>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.version || 'N/A'}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center">No dependencies to show.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Edit Environment: {formState.name}</CardTitle>
                        <CardDescription>Step {step} of 3</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[350px]">
                        {renderStepContent()}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={step === 1 ? () => router.back() : handleBack} disabled={isSaving}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> {step === 1 ? 'Cancel' : 'Back'}
                        </Button>
                        {step < 3 ? (
                            <Button onClick={handleNext} disabled={isNextDisabled()}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                Save Changes
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}

