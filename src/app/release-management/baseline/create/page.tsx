
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Product } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function CreateBaselinePage() {
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchProducts() {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    setProducts(await response.json());
                } else {
                    throw new Error('Failed to fetch products');
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not load products.'
                });
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [toast]);
    
    const handleNext = () => {
        if (!selectedProduct) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select a product to continue.'
            });
            return;
        }
        // For now, we'll just log it. Later steps will use this.
        console.log("Selected Product ID:", selectedProduct);
        toast({
            title: "Next Step: Review",
            description: `Ready to review baseline for product ID: ${selectedProduct}`
        })
    };

    return (
        <DashboardLayout user={user}>
             <main className="flex-1 p-6 md:p-10 flex justify-center items-start">
                 <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Baseline</CardTitle>
                        <CardDescription>Phase 1: Select the product to create a new baseline for.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <Label htmlFor="product-select">Product</Label>
                                <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                                    <SelectTrigger id="product-select">
                                        <SelectValue placeholder="Select a product..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(product => (
                                            <SelectItem key={product._id} value={product._id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleNext} disabled={!selectedProduct || loading}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Next: Review Baseline
                        </Button>
                    </CardFooter>
                 </Card>
            </main>
        </DashboardLayout>
    );
}
