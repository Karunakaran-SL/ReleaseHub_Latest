
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Product, CmdbTenant } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Package, Warehouse, Puzzle, AppWindow, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';

function DependencyItem({ item, icon }: { item: { id: string, name: string, version: string }, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
            {icon}
            <div className="flex-grow">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">Version: {item.version}</p>
            </div>
        </div>
    );
}

export default function CreateBaselinePage() {
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [allTenants, setAllTenants] = useState<CmdbTenant[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [dependencyTree, setDependencyTree] = useState<any | null>(null);
    const [tenantVersionSelections, setTenantVersionSelections] = useState<Record<string, string>>({});
    
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingTree, setLoadingTree] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, tenantsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/cmdb/tenants'),
                ]);

                if (productsRes.ok) {
                    setProducts(await productsRes.json());
                } else {
                    throw new Error('Failed to fetch products');
                }
                
                if (tenantsRes.ok) {
                    setAllTenants(await tenantsRes.json());
                } else {
                    throw new Error('Failed to fetch tenants');
                }

            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not load initial data.'
                });
            } finally {
                setLoadingProducts(false);
            }
        }
        fetchInitialData();
    }, [toast]);

    const handleProductSelect = async (productId: string) => {
        setSelectedProductId(productId);
        setTenantVersionSelections({});
        if (!productId) {
            setDependencyTree(null);
            return;
        }
        setLoadingTree(true);
        try {
            const response = await fetch(`/api/dependency-tree/product/${productId}`);
            if (response.ok) {
                const tree = await response.json();
                setDependencyTree(tree);
                // Set default versions to latest for each tenant in the tree
                const initialVersions: Record<string, string> = {};
                tree.tenants.forEach((tenant: any) => {
                    initialVersions[tenant.id] = tenant.version; // The tree provides the latest version
                });
                setTenantVersionSelections(initialVersions);
            } else {
                 throw new Error('Failed to generate dependency tree.');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            });
            setDependencyTree(null);
        } finally {
            setLoadingTree(false);
        }
    };
    
    const handleTenantVersionChange = (tenantId: string, version: string) => {
        setTenantVersionSelections(prev => ({ ...prev, [tenantId]: version }));
    };

    const handleNext = () => {
        if (!selectedProductId || !dependencyTree) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select a product and wait for the dependency tree to load.'
            });
            return;
        }
        
        const selectionsForStorage = {
            productId: selectedProductId,
            productVersion: dependencyTree.product.version,
            tenantVersions: tenantVersionSelections,
        };

        try {
            sessionStorage.setItem(`baseline-selections-${selectedProductId}`, JSON.stringify(selectionsForStorage));
            router.push(`/release-management/baseline/review?productId=${selectedProductId}`);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not prepare data for the next step. The data might be too large for the session.'
            });
        }
    };

    return (
        <DashboardLayout user={user}>
             <main className="flex-1 p-6 md:p-10 flex justify-center items-start">
                 <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>Create New Baseline</CardTitle>
                        <CardDescription>Phase 1: Select the product and versions to create a new baseline for.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loadingProducts ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <Label htmlFor="product-select">Product</Label>
                                <Select onValueChange={handleProductSelect} value={selectedProductId}>
                                    <SelectTrigger id="product-select" className="w-full md:w-1/2">
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

                        {loadingTree && (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p className="ml-4 text-muted-foreground">Building dependency tree...</p>
                            </div>
                        )}

                        {dependencyTree && !loadingTree && (
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold">Dependency Summary for {dependencyTree.name}</h3>
                                <Accordion type="multiple" defaultValue={['tenants', 'specifications']} className="w-full">
                                    <AccordionItem value="specifications">
                                        <AccordionTrigger>Specifications ({dependencyTree.specifications.length})</AccordionTrigger>
                                        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {dependencyTree.specifications.map((spec: any) => <DependencyItem key={spec.id} item={spec} icon={<FileText className="h-6 w-6 text-indigo-500" />} />)}
                                        </AccordionContent>
                                    </AccordionItem>
                                     {dependencyTree.tenants.map((tenant: any) => (
                                        <AccordionItem value={tenant.id} key={tenant.id}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-2">
                                                    <Warehouse className="h-5 w-5" />
                                                    <span>Tenant: {tenant.name}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-6 space-y-4">
                                                <div className="space-y-2 max-w-xs">
                                                     <Label htmlFor={`version-${tenant.id}`}>Tenant Version</Label>
                                                     <Select 
                                                        value={tenantVersionSelections[tenant.id]} 
                                                        onValueChange={(version) => handleTenantVersionChange(tenant.id, version)}>
                                                         <SelectTrigger id={`version-${tenant.id}`}>
                                                             <SelectValue />
                                                         </SelectTrigger>
                                                         <SelectContent>
                                                             {allTenants.filter(t => t.name === tenant.name).map(t_version => (
                                                                <SelectItem key={t_version.id} value={t_version.version || '1.0.0'}>
                                                                    {t_version.version}
                                                                </SelectItem>
                                                             ))}
                                                         </SelectContent>
                                                     </Select>
                                                 </div>
                                                <h4 className="font-semibold text-sm">Components ({tenant.components.length})</h4>
                                                {tenant.components.length > 0 ? tenant.components.map((comp: any) => <DependencyItem key={comp.id} item={comp} icon={<Puzzle className="h-6 w-6 text-green-500" />} />) : <p className="text-xs text-muted-foreground">No components found.</p>}
                                                <h4 className="font-semibold text-sm mt-4">Applications ({tenant.applications.length})</h4>
                                                {tenant.applications.length > 0 ? tenant.applications.map((app: any) => <DependencyItem key={app.id} item={app} icon={<AppWindow className="h-6 w-6 text-blue-500" />} />) : <p className="text-xs text-muted-foreground">No applications found.</p>}
                                            </AccordionContent>
                                        </AccordionItem>
                                     ))}
                                </Accordion>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleNext} disabled={!selectedProductId || loadingProducts || loadingTree}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Next: Review Baseline
                        </Button>
                    </CardFooter>
                 </Card>
            </main>
        </DashboardLayout>
    );
}
