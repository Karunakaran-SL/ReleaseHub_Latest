
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
import type { User, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterface, Product, AnyCmdbEntity, EntityType } from '@/lib/definitions';
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

function DependencyCard({ item, isSelected = false, onSelect }: { item: AnyCmdbEntity; isSelected?: boolean; onSelect: () => void; }) {
    const Icon = entityTypeDetails[item.entityType].icon;
    const linkPrefix = entityTypeDetails[item.entityType].linkPrefix;

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
            <Badge variant={isSelected ? 'secondary' : 'outline'} className="capitalize text-xs">{item.entityType}</Badge>
            <Button asChild variant="ghost" size="icon" className={cn("absolute top-1 right-1 h-6 w-6", isSelected ? 'text-primary-foreground hover:bg-primary/80' : 'text-muted-foreground')} onClick={(e) => e.stopPropagation()}>
                <Link href={`${linkPrefix}/${item._id}/view`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

function InheritanceCard({ item, children }: { item: AnyCmdbEntity; children?: React.ReactNode }) {
    const Icon = entityTypeDetails[item.entityType].icon;
     const linkPrefix = entityTypeDetails[item.entityType].linkPrefix;

    return (
        <div className="flex items-start gap-3">
             <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground"/>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <Badge variant="outline" className="capitalize text-xs">{item.entityType}</Badge>
                     <Button asChild variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                        <Link href={`${linkPrefix}/${item._id}/view`} target="_blank">
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                     </Button>
                </div>
                 <p className="text-xs text-muted-foreground">Version: {item.version || 'N/A'}</p>
            </div>
            {children && <div className="pl-4 border-l-2 border-dashed ml-2 mt-6 space-y-4">{children}</div>}
        </div>
    );
}


export default function DependencyMetricsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [allData, setAllData] = useState<Record<EntityType, AnyCmdbEntity[]>>({
        product: [],
        tenant: [],
        component: [],
        application: [],
        interface: [],
    });
    
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const selectedEntityType = (searchParams.get('type') as EntityType) || 'tenant';
    const selectedItemId = searchParams.get('id');

    useEffect(() => {
        getUser().then(setUser);
        
        async function fetchData() {
            setLoading(true);
            try {
                const types: EntityType[] = ['product', 'tenant', 'component', 'application', 'interface'];
                const responses = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications'),
                    fetch('/api/cmdb/interfaces'),
                ]);

                const data: Record<EntityType, AnyCmdbEntity[]> = { product: [], tenant: [], component: [], application: [], interface: [] };
                for (let i = 0; i < types.length; i++) {
                    if (responses[i].ok) {
                        const items = await responses[i].json();
                        data[types[i]] = items.map((item: any) => ({ ...item, entityType: types[i] }));
                    }
                }
                setAllData(data);
                
                if (!selectedItemId && data[selectedEntityType]?.length > 0) {
                    handleItemSelect(data[selectedEntityType][0]._id);
                }

            } catch (error) {
                console.error("Failed to fetch dependency data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleEntityTypeChange = (type: EntityType) => {
        const firstItemId = allData[type]?.[0]?._id;
        router.push(`/dependency-metrics?type=${type}${firstItemId ? `&id=${firstItemId}` : ''}`);
    };

    const handleItemSelect = (id: string) => {
        router.push(`/dependency-metrics?type=${selectedEntityType}&id=${id}`);
    };

    const { selectedItem, usedBy, dependsOn, inherits } = useMemo(() => {
        if (!selectedItemId) return { selectedItem: null, usedBy: [], dependsOn: [], inherits: [] };

        const allEntities = Object.values(allData).flat();
        const item = allEntities.find(e => e._id === selectedItemId);

        if (!item) return { selectedItem: null, usedBy: [], dependsOn: [], inherits: [] };
        
        const usedBySet = new Set<AnyCmdbEntity>();
        const dependsOnSet = new Set<AnyCmdbEntity>();
        
        const findAndAddEntity = (id: string, set: Set<AnyCmdbEntity>) => {
            const found = allEntities.find(e => e._id === id);
            if (found) set.add(found);
        };

        // Calculate "Depends On" for the selected item
        const itemAsTenant = item as CmdbTenant;
        itemAsTenant.dependent_tenants?.forEach(d => findAndAddEntity(d.id, dependsOnSet));
        itemAsTenant.products?.forEach(p => findAndAddEntity(p.id, dependsOnSet));

        const itemAsCommon = item as (CmdbComponent | CmdbApplication);
        itemAsCommon.tenants?.forEach(t => findAndAddEntity(t.id, dependsOnSet));
        itemAsCommon.dependent_components?.forEach(d => findAndAddEntity(d.id, dependsOnSet));
        itemAsCommon.dependent_applications?.forEach(d => findAndAddEntity(d.id, dependsOnSet));
        itemAsCommon.dependent_interfaces?.forEach(d => findAndAddEntity(d.id, dependsOnSet));

        const itemAsProduct = item as Product;
        itemAsProduct.specifications?.forEach(s => findAndAddEntity(s.id, dependsOnSet));

        const itemAsInterface = item as CmdbInterface;
        if (itemAsInterface.source?.id) findAndAddEntity(itemAsInterface.source.id, dependsOnSet);
        
        // Calculate "Used By" for the selected item
        allEntities.forEach(entity => {
            if (entity._id === item._id) return;
            
            const entityAsTenant = entity as CmdbTenant;
            if (entityAsTenant.dependent_tenants?.some(d => d.id === item._id)) usedBySet.add(entity);
            if (entityAsTenant.products?.some(p => p.id === item._id)) usedBySet.add(entity);

            const entityAsCommon = entity as (CmdbComponent | CmdbApplication);
            if(entityAsCommon.tenants?.some(t => t.id === item._id)) usedBySet.add(entity);
            if(entityAsCommon.dependent_components?.some(d => d.id === item._id)) usedBySet.add(entity);
            if(entityAsCommon.dependent_applications?.some(d => d.id === item._id)) usedBySet.add(entity);
            if(entityAsCommon.dependent_interfaces?.some(d => d.id === item._id)) usedBySet.add(entity);
            if(entityAsCommon.provided_interfaces?.some(d => d.id === item._id)) usedBySet.add(entity);

             const entityAsProduct = entity as Product;
             if (entityAsProduct.specifications?.some(s => s.id === item._id)) usedBySet.add(entity);

            const entityAsInterface = entity as CmdbInterface;
            if (entityAsInterface.source?.id === item._id) usedBySet.add(entity);
        });

        // Simplified inheritance/composition view
        const inheritsSet = new Set<AnyCmdbEntity>();
        if ((item as CmdbComponent | CmdbApplication).provided_interfaces) {
             (item as CmdbComponent | CmdbApplication).provided_interfaces?.forEach(pi => {
                 const found = allEntities.find(e => e._id === pi.id);
                 if (found) inheritsSet.add(found)
             })
        }
        if ((item as CmdbTenant).products) {
            (item as CmdbTenant).products?.forEach(p => {
                const found = allEntities.find(e => e._id === p.id);
                if (found) inheritsSet.add(found);
            });
        }


        return {
            selectedItem: item,
            usedBy: Array.from(usedBySet),
            dependsOn: Array.from(dependsOnSet),
            inherits: Array.from(inheritsSet)
        };
    }, [allData, selectedItemId]);
    
     const summaryData = [
        ...usedBy.map(item => ({ relationship: 'Used By', item })),
        ...dependsOn.map(item => ({ relationship: 'Depends On', item })),
    ];
    
    if (loading) {
         return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <h1 className="text-3xl font-bold">Dependency Metrics</h1>

                <div className="flex gap-4">
                    <div className="w-1/4">
                        <label className="text-sm font-medium">Entity Type</label>
                        <Select value={selectedEntityType} onValueChange={handleEntityTypeChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(entityTypeDetails).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-3/4">
                        <label className="text-sm font-medium">Select Item</label>
                         <Select value={selectedItemId || ''} onValueChange={handleItemSelect}>
                            <SelectTrigger><SelectValue placeholder="Select an item..." /></SelectTrigger>
                            <SelectContent>
                                {allData[selectedEntityType].map(item => (
                                    <SelectItem key={item._id} value={item._id}>
                                        {item.name} (v{item.version || 'N/A'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {selectedItem ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <CardHeader><CardTitle>Dependency Graph for: {selectedItem.name}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                     <h3 className="font-semibold text-lg flex items-center gap-2 self-start"><ArrowUp className="text-blue-500" /> Used By</h3>
                                     {usedBy.length > 0 ? (
                                        <div className="w-full space-y-2 pl-4">
                                        {usedBy.map((item, index) => (
                                            <div key={item._id} className="flex items-center gap-2">
                                                <div className="w-4 h-full border-l-2 border-blue-500 relative">
                                                    <div className={cn("w-full h-px bg-blue-500 absolute", usedBy.length > 1 ? 'top-1/2' : 'bottom-1/2' )}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <DependencyCard item={item} onSelect={() => router.push(`/dependency-metrics?type=${item.entityType}&id=${item._id}`)} />
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                     ) : <p className="text-sm text-muted-foreground py-2">None</p>}
                                </div>
                                <div className="my-2">
                                     <DependencyCard item={selectedItem} isSelected={true} onSelect={() => {}} />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                     <h3 className="font-semibold text-lg flex items-center gap-2 self-start"><ArrowDown className="text-orange-500" /> Depends On</h3>
                                      {dependsOn.length > 0 ? (
                                        <div className="w-full space-y-2 pl-4">
                                        {dependsOn.map((item, index) => (
                                            <div key={item._id} className="flex items-center gap-2">
                                                <div className="w-4 h-full border-l-2 border-orange-500 relative">
                                                    <div className="w-full h-px bg-orange-500 absolute top-1/2"></div>
                                                </div>
                                                <div className="flex-1">
                                                    <DependencyCard item={item} onSelect={() => router.push(`/dependency-metrics?type=${item.entityType}&id=${item._id}`)} />
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                     ) : <p className="text-sm text-muted-foreground py-2">None</p>}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-1">
                            <CardHeader><CardTitle>Inheritance Graph</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                <InheritanceCard item={selectedItem}>
                                {inherits.length > 0 && inherits.map(child => (
                                    <InheritanceCard key={child._id} item={child} />
                                ))}
                                </InheritanceCard>
                            </CardContent>
                        </Card>
                         <Card className="lg:col-span-1">
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
                        <p>Please select an entity to view its dependencies.</p>
                    </div>
                )}
            </main>
        </DashboardLayout>
    );
}

    