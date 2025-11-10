
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Building, Puzzle, AppWindow, Network, Box, GitMerge, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, AnyCmdbEntity, EntityType, DependencyTree, Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterface } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const entityTypeDetails: Record<EntityType, { label: string; icon: React.ElementType; linkPrefix: string; apiPath: string, idField: '_id' | 'id'}> = {
    product: { label: 'Product', icon: Box, linkPrefix: '/products', apiPath: '/api/products', idField: '_id' },
    tenant: { label: 'Tenant', icon: Building, linkPrefix: '/cmdb/tenants', apiPath: '/api/cmdb/tenants', idField: '_id' },
    component: { label: 'Component', icon: Puzzle, linkPrefix: '/cmdb/components', apiPath: '/api/cmdb/components', idField: '_id' },
    application: { label: 'Application', icon: AppWindow, linkPrefix: '/cmdb/applications', apiPath: '/api/cmdb/applications', idField: '_id' },
    interface: { label: 'Interface', icon: Network, linkPrefix: '/cmdb/interfaces', apiPath: '/api/cmdb/interfaces', idField: '_id' },
};

function DependencyCard({ item, entityType, onSelect, isSelected }: { item: any, entityType: EntityType, onSelect: () => void, isSelected?: boolean }) {
    const Icon = entityTypeDetails[entityType]?.icon || Box;
    const linkPrefix = entityTypeDetails[entityType]?.linkPrefix || '/';
    const idToUse = item._id || item.id;

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
                <Link href={`${linkPrefix}/${idToUse}/view`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

export default function DependencyMetricsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingTree, setLoadingTree] = useState(false);
    const [entityList, setEntityList] = useState<AnyCmdbEntity[]>([]);
    const [dependencyTree, setDependencyTree] = useState<DependencyTree | null>(null);
    const { toast } = useToast();
    
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const selectedEntityType = searchParams.get('type') as EntityType || 'product';
    const selectedEntityId = searchParams.get('id');

    const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);

    const handleUpdateMetrics = async () => {
        setIsUpdatingMetrics(true);
        toast({ title: 'Updating Metrics', description: 'Generating dependency trees for all products...' });
        try {
            const response = await fetch('/api/dependency-tree/update-all', { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                toast({ title: 'Success', description: result.message });
                // Optionally re-fetch the current tree if it was affected
                if (selectedEntityId) {
                    fetchTree();
                }
            } else {
                throw new Error(result.message || 'Failed to update metrics.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsUpdatingMetrics(false);
        }
    };


    const fetchEntityList = useCallback(async (type: EntityType) => {
        setLoading(true);
        setEntityList([]);
        try {
            const apiPath = entityTypeDetails[type].apiPath;
            const res = await fetch(apiPath);
            if (res.ok) {
                const data = await res.json();
                setEntityList(data);
                if (data.length > 0 && (!selectedEntityId || type !== selectedEntityType)) {
                    router.push(`/dependency-metrics?type=${type}&id=${data[0].id}`);
                }
            } else {
                toast({ variant: 'destructive', title: 'Error', description: `Failed to load ${type} list.` });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load entity list.' });
        } finally {
            setLoading(false);
        }
    }, [router, selectedEntityId, selectedEntityType, toast]);

     const fetchTree = useCallback(async () => {
        if (!selectedEntityId) {
            setDependencyTree(null);
            return;
        }
        
        setLoadingTree(true);
        setDependencyTree(null);
        
        try {
            const res = await fetch(`/api/dependency-tree/${selectedEntityType}/${selectedEntityId}`);

            if (res.ok) {
                setDependencyTree(await res.json());
            } else if (res.status !== 404) {
                const errorText = await res.text();
                console.error(`Failed to fetch dependency tree for ${selectedEntityType}:${selectedEntityId}. Response: ${errorText}`);
                toast({ variant: 'destructive', title: 'Error', description: `Failed to load dependency tree.` });
            }
        } catch (error) {
             console.error("Error fetching dependency tree:", error);
             toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while loading the dependency tree.' });
        } finally {
            setLoadingTree(false);
        }
    }, [selectedEntityId, selectedEntityType, toast]);


    useEffect(() => {
        getUser().then(setUser);
        fetchEntityList(selectedEntityType);
    }, [selectedEntityType, fetchEntityList]);


    useEffect(() => {
        if (selectedEntityId && entityList.length > 0) {
            const entityExists = entityList.some(e => e.id === selectedEntityId);
            if (entityExists) {
                fetchTree();
            }
        }
    }, [selectedEntityId, entityList, fetchTree]);
    
    const handleEntityTypeChange = (type: EntityType) => {
        router.push(`/dependency-metrics?type=${type}`);
    };
    
    const handleEntityChange = (id: string) => {
        router.push(`/dependency-metrics?type=${selectedEntityType}&id=${id}`);
    };

    const { selectedItem, usedBy, dependsOn } = useMemo(() => {
        if (!dependencyTree || !selectedEntityId) return { selectedItem: null, usedBy: [], dependsOn: [] };
        
        const allTreeEntities: (AnyCmdbEntity & { entityType: EntityType })[] = [
            ...(dependencyTree.product ? [{ ...dependencyTree.product, entityType: 'product' as EntityType }] : []),
            ...dependencyTree.tenants.map(t => ({ ...t, entityType: 'tenant' as EntityType })),
            ...dependencyTree.components.map(c => ({ ...c, entityType: 'component' as EntityType })),
            ...dependencyTree.applications.map(a => ({ ...a, entityType: 'application' as EntityType })),
            ...dependencyTree.interfaces.map(i => ({ ...i, entityType: 'interface' as EntityType })),
        ] as any;
        
        const currentItem = allTreeEntities.find(e => e.id.toString() === selectedEntityId);
        if (!currentItem) return { selectedItem: null, usedBy: [], dependsOn: [] };
        
        const usedBySet = new Set<AnyCmdbEntity & { entityType: EntityType }>();
        const dependsOnSet = new Set<AnyCmdbEntity & { entityType: EntityType }>();
        
        allTreeEntities.forEach(entity => {
            if (entity.id === currentItem.id) return;
            const dependencies = [
                ...((entity as CmdbTenant).dependent_tenants || []),
                ...((entity as CmdbComponent | CmdbApplication).dependent_components || []),
                ...((entity as CmdbComponent | CmdbApplication).dependent_applications || []),
                ...((entity as CmdbComponent | CmdbApplication).dependent_interfaces || []),
                 ...((entity as Product).specifications || []),
                ((entity as CmdbInterface).source ? [((entity as CmdbInterface).source)] : []),
                ...((entity as CmdbTenant).products || [])
            ].filter(Boolean);
            
            if (dependencies.some(dep => dep && dep.id === currentItem.id)) {
                usedBySet.add(entity);
            }
        });

        const currentAsAny = currentItem as any;
         const dependencies = [
            ...(currentAsAny.dependent_tenants || []),
            ...(currentAsAny.dependent_components || []),
            ...(currentAsAny.dependent_applications || []),
            ...(currentAsAny.dependent_interfaces || []),
            ...(currentAsAny.specifications || []),
            (currentAsAny.source ? [currentAsAny.source] : []),
             ...(currentAsAny.products || [])
         ].filter(Boolean);

         dependencies.forEach(dep => {
            const found = allTreeEntities.find(e => e.id === dep.id);
            if (found) dependsOnSet.add(found);
         });

        return {
            selectedItem: currentItem,
            usedBy: Array.from(usedBySet),
            dependsOn: Array.from(dependsOnSet),
        };
    }, [dependencyTree, selectedEntityId]);
    
    const summaryData = [
        ...usedBy.map(item => ({ relationship: 'Used By', item })),
        ...dependsOn.map(item => ({ relationship: 'Depends On', item })),
    ];
    
     if (loading && entityList.length === 0) {
         return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dependency Metrics</h1>
                    <Button onClick={handleUpdateMetrics} disabled={isUpdatingMetrics}>
                        {isUpdatingMetrics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Metrics
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                        <Label>Select Entity Type</Label>
                         <Select value={selectedEntityType} onValueChange={handleEntityTypeChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(entityTypeDetails).map(([type, {label}]) => (
                                    <SelectItem key={type} value={type}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                         <Label>Select Entity</Label>
                         <Select value={selectedEntityId || ''} onValueChange={handleEntityChange}>
                            <SelectTrigger><SelectValue placeholder="Select an entity..." /></SelectTrigger>
                            <SelectContent>
                                {entityList.map(entity => (
                                    <SelectItem key={entity._id} value={entity.id}>
                                        {entity.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loadingTree ? (
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
                                            <div key={item.id} className="flex items-center gap-2">
                                                <div className="w-4 h-full border-l-2 border-blue-500 relative">
                                                    <div className={cn("w-full h-px bg-blue-500 absolute top-1/2" )}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <DependencyCard item={item} entityType={item.entityType} onSelect={() => handleEntityChange(item.id)} />
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
                                            <div key={item.id} className="flex items-center gap-2">
                                                <div className="w-4 h-full border-l-2 border-orange-500 relative">
                                                    <div className="w-full h-px bg-orange-500 absolute top-1/2"></div>
                                                </div>
                                                <div className="flex-1">
                                                     <DependencyCard item={item} entityType={item.entityType} onSelect={() => handleEntityChange(item.id)} />
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
                                            <TableRow key={`${relationship}-${item.id}`}>
                                                <TableCell>
                                                    <Badge variant={relationship === 'Used By' ? 'default' : 'secondary'} className={relationship === 'Used By' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                                                        {relationship === 'Used By' ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                                                        {relationship}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="link" className="p-0 h-auto" onClick={() => handleEntityChange(item.id)}>
                                                        {item.name}
                                                    </Button>
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
