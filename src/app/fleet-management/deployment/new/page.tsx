
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
import { Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewDeploymentWizardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);

    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [selectedSpec, setSelectedSpec] = useState<string>('');

    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, specsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications')
                ]);
                if (!productsRes.ok || !specsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [toast]);
    
    const handleNext = () => {
        // We will implement the next step logic here
        toast({ title: 'Next Step', description: 'Proceeding to Hypervisor selection.' });
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>New Deployment Wizard</CardTitle>
                        <CardDescription>Step 1: Select Product and Specification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                         <Button onClick={handleNext} disabled={!selectedProduct || !selectedSpec}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
