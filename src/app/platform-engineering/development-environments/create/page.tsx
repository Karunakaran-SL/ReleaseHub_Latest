
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, Baseline, CmdbTenant } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ArrowLeft, Package, Warehouse } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelectListBox, type Option as MultiSelectOption } from '@/components/ui/multi-select-list-box';
import { useRouter } from 'next/navigation';

interface WizardData {
    name?: string;
    productId?: string;
    productName?: string;
    specificationId?: string;
    specName?: string;
    selectionMode?: 'baseline' | 'manual';
    baselineId?: string;
    tenantIds?: string[];
}

export default function CreateDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({});

    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [productsRes, specsRes, baselinesRes, tenantsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/baselines'),
                    fetch('/api/cmdb/tenants'),
                ]);
                if (!productsRes.ok || !specsRes.ok || !baselinesRes.ok || !tenantsRes.ok) throw new Error('Failed to fetch initial data.');
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setBaselines(await baselinesRes.json());
                setTenants(await tenantsRes.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleUpdate = (data: Partial<WizardData>) => {
        setWizardData(prev => ({ ...prev, ...data }));
    };
    
    const handleCreateEnvironment = async () => {
        setLoading(true);
        try {
            const payload = {
                name: wizardData.name,
                productId: wizardData.productId,
                productName: wizardData.productName,
                specificationId: wizardData.specificationId,
                specName: wizardData.specName,
                baselineId: wizardData.baselineId,
                tenantIds: wizardData.tenantIds,
                // These are placeholder values
                estimatedCost: 25.00,
                resourceUsage: { cpu: '16 vCPU', memory: '64 GB', storage: '500 GB' }
            };

            const response = await fetch('/api/development-environments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create environment.');

            toast({ title: 'Success', description: 'Development environment is being provisioned.' });
            router.push('/platform-engineering/development-environments');
            router.refresh();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const isNextDisabled = (): boolean => {
        switch (step) {
            case 1: return !wizardData.name || !wizardData.productId || !wizardData.specificationId;
            case 2:
                if (!wizardData.selectionMode) return true;
                if (wizardData.selectionMode === 'baseline' && !wizardData.baselineId) return true;
                if (wizardData.selectionMode === 'manual' && (!wizardData.tenantIds || wizardData.tenantIds.length === 0)) return true;
                return false;
            case 3: return false;
            default: return false;
        }
    };
    
    const renderStepContent = () => {
        if (loading) {
            return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }

        switch(step) {
            case 1: // Select Product and Spec
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <Label htmlFor="env-name">Environment Name *</Label>
                             <Input id="env-name" placeholder="e.g., feature-xyz-testing" value={wizardData.name || ''} onChange={(e) => handleUpdate({ name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-select">Product *</Label>
                            <Select value={wizardData.productId} onValueChange={(v) => handleUpdate({ productId: v, productName: products.find(p => p._id === v)?.name })}>
                                <SelectTrigger id="product-select"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                                <SelectContent>
                                    {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="spec-select">Specification *</Label>
                            <Select value={wizardData.specificationId} onValueChange={(v) => handleUpdate({ specificationId: v, specName: specifications.find(s => s._id === v)?.name })}>
                                <SelectTrigger id="spec-select"><SelectValue placeholder="Select a specification..." /></SelectTrigger>
                                <SelectContent>
                                    {specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground pt-2">Note: This is a virtual environment for functional testing only, not for performance/non-functional testing.</p>
                        </div>
                    </div>
                );
            
            case 2: // Select Baseline or Tenants
                return (
                    <div className="space-y-6">
                        <RadioGroup value={wizardData.selectionMode} onValueChange={(v) => handleUpdate({ selectionMode: v as 'baseline' | 'manual', baselineId: undefined, tenantIds: [] })}>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="baseline" id="mode-baseline"/>
                                <Label htmlFor="mode-baseline">Use a Baseline</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="manual" id="mode-manual"/>
                                <Label htmlFor="mode-manual">Select Tenants Manually</Label>
                             </div>
                        </RadioGroup>
                        <Separator />
                        {wizardData.selectionMode === 'baseline' && (
                             <div className="space-y-2">
                                <Label htmlFor="baseline-select">Baseline</Label>
                                <Select value={wizardData.baselineId} onValueChange={(v) => handleUpdate({ baselineId: v })}>
                                    <SelectTrigger id="baseline-select"><SelectValue placeholder="Select a baseline..." /></SelectTrigger>
                                    <SelectContent>
                                        {baselines.filter(b => b.product.id === wizardData.productId && b.status === 'RELEASED').map(b => (
                                            <SelectItem key={b._id} value={b._id}>{b.product.name} v{b.product.version}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                         {wizardData.selectionMode === 'manual' && (
                             <div className="space-y-2">
                                <Label>Tenants</Label>
                                <MultiSelectListBox
                                    available={tenants.filter(t => !(wizardData.tenantIds || []).includes(t.id)).map(t => ({id: t.id, label: t.name}))}
                                    chosen={(wizardData.tenantIds || []).map(id => {
                                        const tenant = tenants.find(t => t.id === id);
                                        return { id: id, label: tenant?.name || id };
                                    })}
                                    onMoveToChosen={(ids) => handleUpdate({ tenantIds: [...(wizardData.tenantIds || []), ...ids] })}
                                    onMoveToAvailable={(ids) => handleUpdate({ tenantIds: (wizardData.tenantIds || []).filter(id => !ids.includes(id))})}
                                    onMoveAllToChosen={() => handleUpdate({ tenantIds: tenants.map(t => t.id) })}
                                    onMoveAllToAvailable={() => handleUpdate({ tenantIds: [] })}
                                />
                            </div>
                        )}
                    </div>
                );
            case 3: // Summary
                 let summaryItems: any[] = [];
                if (wizardData.selectionMode === 'baseline') {
                    const baseline = baselines.find(b => b._id === wizardData.baselineId);
                    if (baseline) {
                         summaryItems = baseline.tenants?.flatMap((t: any) => [
                            { type: 'Tenant', ...t },
                            ...(t.components || []).map((c: any) => ({ type: 'Component', ...c})),
                            ...(t.applications || []).map((a: any) => ({ type: 'Application', ...a}))
                         ]);
                    }
                } else {
                     summaryItems = tenants.filter(t => wizardData.tenantIds?.includes(t.id)).map(t => ({type: 'Tenant', ...t}));
                }
                return (
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Dependency Summary</h3>
                        <p className="text-sm text-muted-foreground mb-4">The following will be provisioned in the new environment.</p>
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
            
            case 4: // Final Summary and Cost
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Final Review</h3>
                        <Card>
                            <CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
                                <div><Label>Name:</Label> <p>{wizardData.name}</p></div>
                                <div><Label>Product:</Label> <p>{wizardData.productName}</p></div>
                                <div><Label>Specification:</Label> <p>{wizardData.specName}</p></div>
                                 <div><Label>Mode:</Label> <p className="capitalize">{wizardData.selectionMode}</p></div>
                                {wizardData.selectionMode === 'baseline' && (
                                     <div><Label>Baseline:</Label> <p>{baselines.find(b=>b._id === wizardData.baselineId)?.product.version}</p></div>
                                )}
                                <div className="col-span-2"><Label>Tenants:</Label> <p>{wizardData.tenantIds?.length || 'From Baseline'}</p></div>
                                <div className="col-span-2 border-t pt-4 mt-2">
                                     <h4 className="font-semibold">Estimated Resources</h4>
                                     <p>CPU: 16 vCPU</p>
                                     <p>Memory: 64 GB</p>
                                     <p>Storage: 500 GB</p>
                                     <p className="font-bold mt-2">Est. Cost: $25.00 / hr</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Create Development Environment</CardTitle>
                        <CardDescription>Step {step} of 4</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[350px]">
                        {renderStepContent()}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        {step < 4 ? (
                            <Button onClick={handleNext} disabled={isNextDisabled()}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                             <Button onClick={handleCreateEnvironment} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Package className="mr-2 h-4 w-4"/>}
                                Create Environment
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
