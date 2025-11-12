
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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


    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, specsRes, hypervisorsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors')
                ]);
                if (!productsRes.ok || !specsRes.ok || !hypervisorsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setHypervisors(await hypervisorsRes.json());

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
            default:
                return <CardContent><p>End of wizard.</p></CardContent>;
        }
    };
    
    const getStepDescription = () => {
        switch (step) {
            case 1: return "Step 1: Select Product and Specification";
            case 2: return "Step 2: Select Hypervisor or Platform Type";
            default: return "New Deployment";
        }
    }
    
    const isNextDisabled = () => {
        switch (step) {
            case 1: return !selectedProduct || !selectedSpec;
            case 2: return !selectedHypervisor;
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
