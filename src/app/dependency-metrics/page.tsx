'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Building, Puzzle, AppWindow, Network, Box, GitMerge, ArrowRight, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, AnyCmdbEntity, EntityType, DependencyTree, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const entityTypeDetails: Record<EntityType, { label: string; icon: React.ElementType; linkPrefix: string }> = {
    product: { label: 'Product', icon: Box, linkPrefix: '/products' },
    tenant: { label: 'Tenant', icon: Building, linkPrefix: '/cmdb/tenants' },
    component: { label: 'Component', icon: Puzzle, linkPrefix: '/cmdb/components' },
    application: { label: 'Application', icon: AppWindow, linkPrefix: '/cmdb/applications' },
    interface: { label: 'Interface', icon: Network, linkPrefix: '/cmdb/interfaces' },
};

function DependencyCard({ item, entityType, onSelect, isSelected }: { item: any, entityType: EntityType, onSelect: () => void, isSelected?: boolean }) {
    const Icon = entityTypeDetails[entityType]?.icon || Box;
    const linkPrefix = entityTypeDetails[entityType]?.linkPrefix || '/';

    return (
        <div 
            className={cn(
                "relative p-3 rounded-lg border w-full cursor-pointer transition-colors flex items-center gap-3",
                isSelected ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card hover:bg-muted'
            )}
            onClick={onSelect}
        >
            <Icon className="h-6 w-6" />
            <div className="flex-1">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className={cn("text-xs", isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    Version: {item.version || 'N/A'}
                </p>
            </div>
            <Badge variant={isSelected ? 'secondary' : 'outline'} className="capitalize text-xs">{entityType}</Badge>
            <Button asChild variant="ghost" size="icon" className={cn("absolute top-1 right-1 h-6 w-6", isSelected ? 'text-primary-foreground hover:bg-primary/80' : 'text-muted-foreground')} onClick={(e) => e.stopPropagation()}>
                <Link href={`${linkPrefix}/${item._id}/view`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

export default function DependencyMetricsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [dependencyTree, setDependencyTree] = useState<DependencyTree | null>(null);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const selectedProductId = searchParams.get('productId');

    useEffect(() => {
        getUser().then(setUser);
        async function fetchProducts() {
            setLoading(true);
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const products = await res.json();
                    setAllProducts(products);
                    if (!selectedProductId && products.length > 0) {
                        router.push(`/dependency-metrics?productId=${products[0]._id}`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedProductId) return;

        async function fetchTree() {
            setLoading(true);
            setDependencyTree(null);
            try {
                const res = await fetch(`/api/dependency-tree/${selectedProductId}`);
                if (res.ok) {
                    setDependencyTree(await res.json());
                } else {
                    console.error("Failed to fetch dependency tree for product:", selectedProductId);
                }
            } catch (error) {
                 console.error("Error fetching dependency tree:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTree();
    }, [selectedProductId]);
    
    const handleProductChange = (productId: string) => {
        router.push(`/dependency-metrics?productId=${productId}`);
    };

    const { selectedItem, usedBy, dependsOn } = useMemo(() => {
        if (!dependencyTree) return { selectedItem: null, usedBy: [], dependsOn: [] };

        const allEntitiesInTree: (AnyCmdbEntity)[] = [
            ...dependencyTree.tenants.map(t => ({ ...t, entityType: 'tenant' as EntityType })),
            ...dependencyTree.components.map(c => ({ ...c, entityType: 'component' as EntityType })),
            ...dependencyTree.applications.map(a => ({ ...a, entityType: 'application' as EntityType })),
            ...dependencyTree.interfaces.map(i => ({ ...i, entityType: 'interface' as EntityType })),
        ];

        const rootProductEntity = { ...dependencyTree.product, _id: dependencyTree.productId, entityType: 'product' as EntityType };
        
        let selectedItem: AnyCmdbEntity | null = rootProductEntity; // Default to root product
        
        const usedBySet = new Set<AnyCmdbEntity>();
        const dependsOnSet = new Set<AnyCmdbEntity>();

        // For now, this just calculates dependencies for the root product
        // A full implementation would need to recalculate this if another item is clicked.
        
        // Who uses the root product? -> Tenants that list this product
        allEntitiesInTree.forEach(entity => {
            if (entity.entityType === 'tenant' && entity.products?.some(p => p.id === rootProductEntity.id)) {
                usedBySet.add(entity);
            }
        });
        
        // What does the root product depend on? -> Its specifications
        dependencyTree.specifications.forEach(spec => {
             // We'd need a full entity for specs to add them properly
        });


        return {
            selectedItem,
            usedBy: Array.from(usedBySet),
            dependsOn: Array.from(dependsOnSet),
        };
    }, [dependencyTree]);
    
     const summaryData = [
        ...usedBy.map(item => ({ relationship: 'Used By', item })),
        ...dependsOn.map(item => ({ relationship: 'Depends On', item })),
    ];
    
    if (loading && !dependencyTree) {
         return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <h1 className="text-3xl font-bold">Dependency Metrics</h1>

                <div className="w-full">
                    <label className="text-sm font-medium">Select Product</label>
                     <Select value={selectedProductId || ''} onValueChange={handleProductChange}>
                        <SelectTrigger><SelectValue placeholder="Select a product..." /></SelectTrigger>
                        <SelectContent>
                            {allProducts.map(product => (
                                <SelectItem key={product._id} value={product._id}>
                                    {product.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : selectedItem ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <CardHeader><CardTitle>Dependency Graph for: {selectedItem.name}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                     <h3 className="font-semibold text-lg flex items-center gap-2 self-start"><ArrowUp className="text-blue-500" /> Used By</h3>
                                     {usedBy.length > 0 ? (
                                        <div className="w-full space-y-2 pl-4">
                                        {usedBy.map((item) => (
                                            <div key={item._id} className="flex items-center gap-2">
                                                <div className="w-4 h-full border-l-2 border-blue-500 relative">
                                                    <div className={cn("w-full h-px bg-blue-500 absolute top-1/2" )}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <DependencyCard item={item} entityType={item.entityType} onSelect={() => {}} />
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                     ) : <p className="text-sm text-muted-foreground py-2">None</p>}
                                </div>
                                <div className="my-2">
                                     <DependencyCard item={selectedItem} entityType={selectedItem.entityType} isSelected={true} onSelect={() => {}} />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                     <h3 className="font-semibold text-lg flex items-center gap-2 self-start"><ArrowDown className="text-orange-500" /> Depends On</h3>
                                      {dependsOn.length > 0 ? (
                                        <div className="w-full space-y-2 pl-4">
                                        {dependsOn.map((item) => (
                                            <div key={item._id} className="flex items-center gap-2">
                                                <div className="w-4 h-full border-l-2 border-orange-500 relative">
                                                    <div className="w-full h-px bg-orange-500 absolute top-1/2"></div>
                                                </div>
                                                <div className="flex-1">
                                                     <DependencyCard item={item} entityType={item.entityType} onSelect={() => {}} />
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                     ) : <p className="text-sm text-muted-foreground py-2">None</p>}
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="lg:col-span-2">
                            <CardHeader><CardTitle>Dependencies Summary</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Relationship</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Version</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaryData.length > 0 ? summaryData.map(({ relationship, item }) => (
                                            <TableRow key={`${relationship}-${item._id}`}>
                                                <TableCell>
                                                    <Badge variant={relationship === 'Used By' ? 'default' : 'secondary'} className={relationship === 'Used By' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                                                        {relationship === 'Used By' ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                                                        {relationship}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/dependency-metrics?type=${item.entityType}&id=${item._id}`} className="hover:underline">{item.name}</Link>
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className="capitalize">{item.entityType}</Badge></TableCell>
                                                <TableCell>{item.version || 'N/A'}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">No dependencies found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                     <div className="text-center text-muted-foreground py-12">
                        <p>Please select a product to view its dependencies.</p>
                    </div>
                )}
            </main>
        </DashboardLayout>
    );
}