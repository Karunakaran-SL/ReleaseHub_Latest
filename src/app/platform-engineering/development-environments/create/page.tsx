
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function CreateDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);

    const [envName, setEnvName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('');

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [productsRes, specsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications')
                ]);
                if (!productsRes.ok || !specsRes.ok) throw new Error('Failed to fetch initial data.');
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const handleNext = () => {
        // Logic for next step will be implemented here
        toast({ title: 'Next Step', description: 'Proceeding to baseline/tenant selection.' });
    };
    
    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Create Development Environment</CardTitle>
                        <CardDescription>Step 1: Select the Product and Specification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                             <Label htmlFor="env-name">Environment Name *</Label>
                             <Input id="env-name" placeholder="e.g., feature-xyz-testing" value={envName} onChange={(e) => setEnvName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-select">Product *</Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger id="product-select"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                                <SelectContent>
                                    {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="spec-select">Specification *</Label>
                            <Select value={selectedSpec} onValueChange={setSelectedSpec}>
                                <SelectTrigger id="spec-select"><SelectValue placeholder="Select a specification..." /></SelectTrigger>
                                <SelectContent>
                                    {specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground pt-2">Note: This is a virtual environment for functional testing only, not for performance/non-functional testing.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                         <Button onClick={handleNext} disabled={!envName || !selectedProduct || !selectedSpec}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
