
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
        <div className="flex items-center gap-4">
             <div className={`relative p-4 rounded-lg border w-full cursor-pointer transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                onClick={onSelect}
             >
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            Version: {item.version || 'N/A'}
                        </p>
                    </div>
                     <Badge variant={isSelected ? 'secondary' : 'default'} className="capitalize">{item.entityType}</Badge>
                </div>
                 <Button asChild variant="ghost" size="icon" className={`absolute top-1 right-1 h-6 w-6 ${isSelected ? 'text-primary-foreground hover:bg-primary/80' : 'text-muted-foreground'}`} onClick={(e) => e.stopPropagation()}>
                    <Link href={`${linkPrefix}/${item._id}/view`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                 </Button>
            </div>
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
        if (!selectedItemId || !selectedEntityType) return { selectedItem: null, usedBy: [], dependsOn: [], inherits: [] };

        const allEntities = Object.values(allData).flat();
        const item = allEntities.find(e => e._id === selectedItemId && e.entityType === selectedEntityType);

        if (!item) return { selectedItem: null, usedBy: [], dependsOn: [], inherits: [] };
        
        const usedBySet = new Set<AnyCmdbEntity>();
        const dependsOnSet = new Set<AnyCmdbEntity>();
        const inheritsSet = new Set<AnyCmdbEntity>();

        // Find what the selected item depends on
        const checkDependencies = (depArray?: {id: string}[]) => {
             if (!depArray) return;
             depArray.forEach(dep => {
                const found = allEntities.find(e => e._id === dep.id);
                if (found) dependsOnSet.add(found);
             });
        };
        
        checkDependencies((item as CmdbTenant).dependent_tenants);
        checkDependencies((item as CmdbComponent).dependent_components);
        checkDependencies((item as CmdbApplication).dependent_applications);
        checkDependencies((item as CmdbComponent).dependent_interfaces);
        checkDependencies((item as CmdbComponent).tenants);
        checkDependencies((item as Product).specifications);
        checkDependencies((item as CmdbTenant).products);

        if ('source' in item && (item as CmdbInterface).source) {
            const found = allEntities.find(e => e._id === (item as CmdbInterface).source.id);
            if (found) dependsOnSet.add(found);
        }

        // Find what uses the selected item
        allEntities.forEach(entity => {
            if (entity._id === item._id) return;
            const hasDependency = (deps?: {id: string}[]) => deps?.some(d => d.id === item._id) || false;

            if (hasDependency((entity as CmdbTenant).dependent_tenants) ||
                hasDependency((entity as CmdbComponent).dependent_components) ||
                hasDependency((entity as CmdbApplication).dependent_applications) ||
                hasDependency((entity as CmdbComponent).dependent_interfaces) ||
                hasDependency((entity as CmdbComponent).tenants) ||
                hasDependency((entity as Product).specifications) ||
                hasDependency((entity as CmdbTenant).products)) {
                usedBySet.add(entity);
            }
             if ('source' in entity && (entity as CmdbInterface).source?.id === item._id) {
                usedBySet.add(entity);
            }
        });

        // Inheritance specific
        if ((item.entityType === 'component' || item.entityType === 'application') && 'provided_interfaces' in item && item.provided_interfaces) {
            item.provided_interfaces.forEach(pi => {
                const found = allEntities.find(e => e._id === pi.id);
                if (found) inheritsSet.add(found);
            })
        }

        return {
            selectedItem: item,
            usedBy: Array.from(usedBySet),
            dependsOn: Array.from(dependsOnSet),
            inherits: Array.from(inheritsSet)
        };
    }, [allData, selectedEntityType, selectedItemId]);
    
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
                            <CardContent className="space-y-4 text-center">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2"><ArrowUp className="text-green-500" /> Used By</h3>
                                    <div className="space-y-2">
                                        {usedBy.length > 0 ? usedBy.map(item => <DependencyCard key={item._id} item={item} onSelect={() => router.push(`/dependency-metrics?type=${item.entityType}&id=${item._id}`)} />) : <p className="text-sm text-muted-foreground">None</p>}
                                    </div>
                                </div>
                                <div className="my-4">
                                     <DependencyCard item={selectedItem} isSelected={true} onSelect={() => {}} />
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2"><ArrowDown className="text-red-500" /> Depends On</h3>
                                     <div className="space-y-2">
                                        {dependsOn.length > 0 ? dependsOn.map(item => <DependencyCard key={item._id} item={item} onSelect={() => router.push(`/dependency-metrics?type=${item.entityType}&id=${item._id}`)} />) : <p className="text-sm text-muted-foreground">None</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-1">
                            <CardHeader><CardTitle>Inheritance Graph</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-4">
                                     <DependencyCard item={selectedItem} isSelected onSelect={() => {}}/>
                                </div>
                                 {inherits.length > 0 && <div className="pl-6 border-l-2 border-dashed ml-6 my-2 space-y-2 py-2">
                                     {inherits.map(item => (
                                          <div key={item._id} className="flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                            <DependencyCard item={item} onSelect={() => router.push(`/dependency-metrics?type=${item.entityType}&id=${item._id}`)} />
                                        </div>
                                     ))}
                                 </div>}
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
                                                    <Badge variant={relationship === 'Used By' ? 'default' : 'secondary'} className={relationship === 'Used By' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
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
