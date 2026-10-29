'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, Baseline, CmdbTenant } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DevEnvDeploymentPreview } from '../_components/dev-env-deployment-preview';
import DevEnvStep5Progress from '../_components/dev-env-step5-progress';

interface WizardData {
    name?: string;
    productId?: string;
    productName?: string;
    specificationId?: string;
    specName?: string;
    foundationId?: string;
    foundationName?: string;
    selectionMode?: 'baseline' | 'manual';
    baselineId?: string;
    tenantIds?: string[];
    dependencySummary?: {
        type: 'Tenant' | 'Component' | 'Application';
        id: string;
        name: string;
        version: string;
    }[];
}

export default function CreateDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({ selectionMode: 'baseline' });

    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [foundations, setFoundations] = useState<any[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [productsRes, specsRes, foundationsRes, baselinesRes, tenantsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/platform-foundations'),
                    fetch('/api/baselines'),
                    fetch('/api/cmdb/tenants'),
                ]);
                if (!productsRes.ok || !specsRes.ok || !baselinesRes.ok || !tenantsRes.ok || !foundationsRes.ok) throw new Error('Failed to fetch initial data.');
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setFoundations(await foundationsRes.json());
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

    const dependencySummary = useMemo(() => {
        if (!wizardData) return [];
        let items: any[] = [];
        if (wizardData.selectionMode === 'baseline') {
            const baseline = baselines.find(b => b._id === wizardData.baselineId);
            if (baseline) {
                items = (baseline.tenants || []).flatMap((tenant: any) => [
                    { type: 'Tenant', ...tenant },
                    ...(tenant.components || []).map((c: any) => ({ type: 'Component', ...c })),
                    ...(tenant.applications || []).map((a: any) => ({ type: 'Application', ...a }))
                ]);
            }
        } else {
            items = tenants.filter(t => wizardData.tenantIds?.includes(t.id)).map(t => ({ type: 'Tenant', ...t }));
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
    }, [wizardData.selectionMode, wizardData.baselineId, wizardData.tenantIds, baselines, tenants]);

    const [deploymentResult, setDeploymentResult] = useState<{ status: any, logs: any[] }>({ status: 'PROVISIONING', logs: [] });

    const handleCreateEnvironment = async () => {
        setLoading(true);
        if (isManagedK8s) {
            setStep(5);
        }
        try {
            const payload = {
                name: wizardData.name,
                productId: wizardData.productId,
                productName: wizardData.productName,
                specificationId: wizardData.specificationId,
                specName: wizardData.specName,
                foundationId: wizardData.foundationId,
                foundationName: wizardData.foundationName,
                baselineId: wizardData.baselineId,
                tenantIds: wizardData.tenantIds,
                dependencySummary: dependencySummary,
                estimatedCost: 25.00,
                resourceUsage: { cpu: '16 vCPU', memory: '64 GB', storage: '500 GB' }
            };

            const response = await fetch('/api/development-environments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create environment.');

            const result = await response.json();
            if (isManagedK8s) {
                setDeploymentResult({
                    status: result.status,
                    logs: result.deploymentLogs || []
                });
            } else {
                toast({ title: 'Success', description: 'Development environment created successfully.' });
                router.push('/platform-engineering/development-environments');
                router.refresh();
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
            if (isManagedK8s) setStep(4);
        } finally {
            setLoading(false);
        }
    };

    const isNextDisabled = (): boolean => {
        switch (step) {
            case 1: return !wizardData.name || !wizardData.productId || !wizardData.specificationId || !wizardData.foundationId;
            case 2:
                if (!wizardData.selectionMode) return true;
                if (wizardData.selectionMode === 'baseline' && !wizardData.baselineId) return true;
                if (wizardData.selectionMode === 'manual' && (!wizardData.tenantIds || wizardData.tenantIds.length === 0)) return true;
                return false;
            case 3: return false;
            default: return false;
        }
    };

    const selectedSpec = specifications.find(s => s._id === wizardData.specificationId);
    const isManagedK8s = selectedSpec?.clusterType === 'Managed Kubernetes';

    const renderStepContent = () => {
        if (loading) {
            return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }

        switch (step) {
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
                            <Select value={wizardData.specificationId} onValueChange={(v) => handleUpdate({ specificationId: v, specName: specifications.find(s => s._id === v)?.name, foundationId: undefined, foundationName: undefined })}>
                                <SelectTrigger id="spec-select"><SelectValue placeholder="Select a specification..." /></SelectTrigger>
                                <SelectContent>
                                    {specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground pt-2">Note: This is a virtual environment for functional testing only, not for performance/non-functional testing.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="foundation-select">Platform Foundation *</Label>
                            <Select
                                value={wizardData.foundationId}
                                onValueChange={(v) => handleUpdate({ foundationId: v, foundationName: foundations.find(f => f._id === v)?.name })}
                                disabled={!wizardData.specificationId}
                            >
                                <SelectTrigger id="foundation-select"><SelectValue placeholder={wizardData.specificationId ? "Select a foundation..." : "Select a specification first"} /></SelectTrigger>
                                <SelectContent>
                                    {foundations
                                        .filter(f => f.specification?._id === wizardData.specificationId)
                                        .map(f => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case 2: // Select Baseline or Tenants
                return (
                    <div className="space-y-6">
                        <RadioGroup value={wizardData.selectionMode} onValueChange={(v) => handleUpdate({ selectionMode: v as 'baseline' | 'manual', baselineId: undefined, tenantIds: [] })}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="baseline" id="mode-baseline" />
                                <Label htmlFor="mode-baseline">Use a Baseline</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="manual" id="mode-manual" />
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
                                    available={tenants.filter(t => !(wizardData.tenantIds || []).includes(t.id)).map(t => ({ id: t.id, label: t.name }))}
                                    chosen={(wizardData.tenantIds || []).map(id => {
                                        const tenant = tenants.find(t => t.id === id);
                                        return { id: id, label: tenant?.name || id };
                                    })}
                                    onMoveToChosen={(ids) => handleUpdate({ tenantIds: [...(wizardData.tenantIds || []), ...ids] })}
                                    onMoveToAvailable={(ids) => handleUpdate({ tenantIds: (wizardData.tenantIds || []).filter(id => !ids.includes(id)) })}
                                    onMoveAllToChosen={() => handleUpdate({ tenantIds: tenants.map(t => t.id) })}
                                    onMoveAllToAvailable={() => handleUpdate({ tenantIds: [] })}
                                />
                            </div>
                        )}
                    </div>
                );
            case 3: // Summary
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Dependency Summary</h3>
                        <p className="text-sm text-muted-foreground mb-4">The following will be provisioned in the new environment.</p>
                        <Card>
                            <Table>
                                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Version</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {dependencySummary.length > 0 ? dependencySummary.map(item => (
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
                        <h3 className="text-lg font-semibold border-b pb-2">Final Review</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                            <div><Label className="text-muted-foreground">Name:</Label> <p className="font-medium">{wizardData.name}</p></div>
                            <div><Label className="text-muted-foreground">Product:</Label> <p className="font-medium">{wizardData.productName}</p></div>
                            <div><Label className="text-muted-foreground">Specification:</Label> <p className="font-medium">{wizardData.specName}</p></div>
                            <div><Label className="text-muted-foreground">Platform Foundation:</Label> <p className="font-medium">{wizardData.foundationName}</p></div>
                            <div><Label className="text-muted-foreground">Mode:</Label> <p className="font-medium capitalize">{wizardData.selectionMode}</p></div>
                            {wizardData.selectionMode === 'baseline' && (
                                <div><Label className="text-muted-foreground">Baseline:</Label> <p className="font-medium">{baselines.find(b => b._id === wizardData.baselineId)?.product.version}</p></div>
                            )}
                        </div>

                        {isManagedK8s && wizardData.name && (
                            <DevEnvDeploymentPreview
                                envName={wizardData.name}
                                tenants={wizardData.selectionMode === 'baseline'
                                    ? baselines.find(b => b._id === wizardData.baselineId)?.tenants.map((t: any) => ({ id: t.id, name: t.name }))
                                    : tenants.filter(t => wizardData.tenantIds?.includes(t.id)).map(t => ({ id: t.id, name: t.name }))
                                }
                            />
                        )}

                        <Card className="bg-muted/50">
                            <CardContent className="pt-6">
                                <h4 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Estimated Resources</h4>
                                <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                                    <div className="bg-background p-2 rounded border">CPU: <strong>16 vCPU</strong></div>
                                    <div className="bg-background p-2 rounded border">Mem: <strong>64 GB</strong></div>
                                    <div className="bg-background p-2 rounded border">Disk: <strong>500 GB</strong></div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold">
                                    <span>Estimated Hourly Cost</span>
                                    <span className="text-primary text-lg">$25.00 / hr</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 5: // Deployment Progress
                return (
                    <DevEnvStep5Progress
                        logs={deploymentResult.logs}
                        status={deploymentResult.status}
                    />
                );
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>{step === 5 ? 'Deployment Workflow' : 'Create Development Environment'}</CardTitle>
                        <CardDescription>Step {step} of {isManagedK8s ? 5 : 4}</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[350px]">
                        {renderStepContent()}
                    </CardContent>
                    {step < 5 && (
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
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                                    Create Environment
                                </Button>
                            )}
                        </CardFooter>
                    )}
                </Card>
            </main>
        </DashboardLayout>
    );
}
