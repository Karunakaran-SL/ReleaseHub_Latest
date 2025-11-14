
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, Deployment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function UpgradeWizardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    // Wizard state
    const [step, setStep] = useState(1);
    
    // Data for selections
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    
    // User selections
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedSpecId, setSelectedSpecId] = useState('');
    const [productDeployments, setProductDeployments] = useState<Deployment[]>([]);
    const [selectedDeploymentIds, setSelectedDeploymentIds] = useState<Set<string>>(new Set());
    const [upgradeScope, setUpgradeScope] = useState<'baseline' | 'individual' | null>(null);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, specsRes, deploymentsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/deployments'),
                ]);
                if (!productsRes.ok || !specsRes.ok || !deploymentsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setDeployments(await deploymentsRes.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [toast]);
    
    useEffect(() => {
        if (selectedProductId) {
            const filteredDeployments = deployments.filter(d => d.productId === selectedProductId);
            setProductDeployments(filteredDeployments);
        } else {
            setProductDeployments([]);
        }
        setSelectedDeploymentIds(new Set());
    }, [selectedProductId, deployments]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const toggleDeploymentSelection = (deploymentId: string) => {
        setSelectedDeploymentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(deploymentId)) {
                newSet.delete(deploymentId);
            } else {
                newSet.add(deploymentId);
            }
            return newSet;
        });
    };
    
    const toggleAllDeployments = () => {
        if (selectedDeploymentIds.size === productDeployments.length) {
            setSelectedDeploymentIds(new Set());
        } else {
            setSelectedDeploymentIds(new Set(productDeployments.map(d => d._id)));
        }
    };
    
    const isNextDisabled = () => {
        switch (step) {
            case 1: return !selectedProductId || !selectedSpecId;
            case 2: return selectedDeploymentIds.size === 0;
            case 3: return !upgradeScope;
            default: return false;
        }
    };
    
    const getStepDescription = () => {
        switch (step) {
            case 1: return "Step 1: Select Product and Target Specification";
            case 2: return "Step 2: List All Deployments";
            case 3: return "Step 3: Choose Upgrade Scope";
            case 4: return "Step 4: Dependency and Compliance Analysis";
            default: return "Upgrade Wizard";
        }
    };
    
    const renderStepContent = () => {
        if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product-select">Product</Label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                <SelectTrigger id="product-select"><SelectValue placeholder="Select a product to upgrade..." /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spec-select">Target Specification Version</Label>
                            <Select value={selectedSpecId} onValueChange={setSelectedSpecId} disabled={!selectedProductId}>
                                <SelectTrigger id="spec-select"><SelectValue placeholder="Select a target specification..." /></SelectTrigger>
                                <SelectContent>{specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Deployments</CardTitle>
                            <CardDescription>Choose one or more deployments to include in this upgrade.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedDeploymentIds.size > 0 && selectedDeploymentIds.size === productDeployments.length}
                                                onCheckedChange={toggleAllDeployments}
                                            />
                                        </TableHead>
                                        <TableHead>Deployment ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Current Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productDeployments.length > 0 ? productDeployments.map(dep => (
                                        <TableRow key={dep._id} data-state={selectedDeploymentIds.has(dep._id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedDeploymentIds.has(dep._id)}
                                                    onCheckedChange={() => toggleDeploymentSelection(dep._id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono">{dep.details.deploymentId}</TableCell>
                                            <TableCell>{dep.details.customer}</TableCell>
                                            <TableCell>{dep.details.country || 'N/A'}</TableCell>
                                            <TableCell>{dep.status}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">No deployments found for this product.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            case 3:
                return (
                     <div className="space-y-4">
                        <p className="text-muted-foreground">Decide how you want to perform the upgrade. You can use a consistent baseline for all selected deployments or customize the upgrade for individual entities.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card 
                                className={cn("cursor-pointer hover:shadow-lg transition-shadow", upgradeScope === 'baseline' && "ring-2 ring-primary")}
                                onClick={() => setUpgradeScope('baseline')}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><CheckCircle2/> Baseline Upgrade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Apply a global, consistent upgrade using a pre-defined baseline. This is the recommended path for most upgrades.</p>
                                </CardContent>
                            </Card>
                            <Card 
                                className={cn("cursor-pointer hover:shadow-lg transition-shadow", upgradeScope === 'individual' && "ring-2 ring-primary")}
                                onClick={() => setUpgradeScope('individual')}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><SlidersHorizontal /> Individual Upgrade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Manually select specific tenants, components, or applications to upgrade. This offers more granular control.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            case 4:
                return (
                     <div className="text-center p-8">
                        <p className="text-muted-foreground">Step 4: Dependency and Compliance Analysis (Under Construction)</p>
                    </div>
                )
            default:
                return <p>Wizard completed.</p>;
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>Upgrade Wizard</CardTitle>
                        <CardDescription>{getStepDescription()}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>{renderStepContent()}</CardContent>

                    <CardFooter className="flex justify-between">
                         <div>
                            {step > 1 && (
                                <Button variant="outline" onClick={handleBack} disabled={loading}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.push('/fleet-management/deployment')} disabled={loading}>Cancel</Button>
                            
                            {step < 4 ? (
                                <Button onClick={handleNext} disabled={isNextDisabled()}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                               <p className="text-sm text-muted-foreground">End of implemented steps.</p>
                            )}
                         </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
