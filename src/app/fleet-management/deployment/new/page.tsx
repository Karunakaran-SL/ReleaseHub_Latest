
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, CmdbComponent } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';

interface Hypervisor {
    _id: string;
    name: string;
}

export default function NewDeploymentWizardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [step, setStep] = useState(1);
    
    // Step 1 state
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [selectedSpec, setSelectedSpec] = useState<string>('');

    // Step 2 state
    const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
    const [selectedHypervisor, setSelectedHypervisor] = useState<string>('');
    
    // Step 3 state
    const [allComponents, setAllComponents] = useState<CmdbComponent[]>([]);
    const [selectedComponents, setSelectedComponents] = useState<{ id: string; name: string; }[]>([]);


    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, specsRes, hypervisorsRes, componentsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/cmdb/components')
                ]);
                if (!productsRes.ok || !specsRes.ok || !hypervisorsRes.ok || !componentsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setHypervisors(await hypervisorsRes.json());
                setAllComponents(await componentsRes.json());

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [toast]);
    
    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };
    
    const handleMultiSelectChange = (items: { id: string; name: string; }[]) => {
        setSelectedComponents(items);
    };

    const renderMultiSelect = () => {
        const chosenIds = new Set(selectedComponents.map(item => item.id));

        const available: Option[] = allComponents
            .filter(opt => !chosenIds.has(opt.id))
            .map(opt => ({ id: opt.id, label: opt.name }));

        const chosen: Option[] = selectedComponents.map(item => ({ id: item.id, label: item.name }));

        const moveItems = (ids: string[], source: Option[], dest: Option[]) => {
            const itemsToMove = source.filter(item => ids.includes(item.id));
            const newDest = [...dest, ...itemsToMove];
            handleMultiSelectChange(newDest.map(i => ({id: i.id, name: i.label})));
        };
        
        return (
            <MultiSelectListBox
                available={available}
                chosen={chosen}
                onMoveToChosen={(ids) => moveItems(ids, available, chosen)}
                onMoveToAvailable={(ids) => {
                    const newChosen = chosen.filter(item => !ids.includes(item.id));
                    handleMultiSelectChange(newChosen.map(i => ({id: i.id, name: i.label})))
                }}
                onMoveAllToChosen={() => handleMultiSelectChange(available.map(i => ({id: i.id, name: i.label})))}
                onMoveAllToAvailable={() => handleMultiSelectChange([])}
            />
        );
    };

    const renderStepContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )
        }

        switch (step) {
            case 1:
                return (
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product-select">Product</Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger id="product-select">
                                    <SelectValue placeholder="Select a product..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(product => (
                                        <SelectItem key={product._id} value={product._id}>
                                            {product.name} (v{product.version})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spec-select">Specification</Label>
                            <Select value={selectedSpec} onValueChange={setSelectedSpec} disabled={!selectedProduct}>
                                <SelectTrigger id="spec-select">
                                    <SelectValue placeholder="Select a specification..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {specifications.map(spec => (
                                        <SelectItem key={spec._id} value={spec._id}>
                                            {spec.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                );
            case 2:
                 return (
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="hypervisor-select">Hypervisor / Platform Type</Label>
                            <Select value={selectedHypervisor} onValueChange={setSelectedHypervisor}>
                                <SelectTrigger id="hypervisor-select">
                                    <SelectValue placeholder="Select a hypervisor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {hypervisors.map(hypervisor => (
                                        <SelectItem key={hypervisor._id} value={hypervisor._id}>
                                            {hypervisor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                );
            case 3:
                return (
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Default Platform Foundation</Label>
                            <p className="text-sm text-muted-foreground">Select the foundational components for this deployment.</p>
                            {renderMultiSelect()}
                        </div>
                    </CardContent>
                );
            default:
                return <CardContent><p>End of wizard.</p></CardContent>;
        }
    };
    
    const getStepDescription = () => {
        switch (step) {
            case 1: return "Step 1: Select Product and Specification";
            case 2: return "Step 2: Select Hypervisor or Platform Type";
            case 3: return "Step 3: Select Default Platform Foundation";
            default: return "New Deployment";
        }
    }
    
    const isNextDisabled = () => {
        switch (step) {
            case 1: return !selectedProduct || !selectedSpec;
            case 2: return !selectedHypervisor;
            case 3: return selectedComponents.length === 0;
            default: return true;
        }
    }


    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>New Deployment Wizard</CardTitle>
                        <CardDescription>{getStepDescription()}</CardDescription>
                    </CardHeader>
                    
                    {renderStepContent()}

                    <CardFooter className="flex justify-between">
                         <div>
                            {step > 1 && (
                                <Button variant="outline" onClick={handleBack}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button onClick={handleNext} disabled={isNextDisabled()}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                         </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
