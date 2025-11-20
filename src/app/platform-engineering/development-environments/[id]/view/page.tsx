
'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, DevelopmentEnvironment, Product, Specification, Baseline, CmdbTenant } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Warehouse, Puzzle, AppWindow } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    READY: 'bg-green-200 text-green-800',
    ERROR: 'bg-red-200 text-red-800',
    DELETING: 'bg-gray-300 text-gray-900',
};

export default function ViewDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [environment, setEnvironment] = useState<DevelopmentEnvironment | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedData, setRelatedData] = useState({
        product: null as Product | null,
        specification: null as Specification | null,
        baseline: null as Baseline | null,
        tenants: [] as CmdbTenant[],
    });

    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchData() {
            setLoading(true);
            try {
                const [envRes, productsRes, specsRes, baselinesRes, tenantsRes] = await Promise.all([
                    fetch(`/api/development-environments/${id}`),
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/baselines'),
                    fetch('/api/cmdb/tenants'),
                ]);

                if (!envRes.ok) throw new Error('Failed to fetch environment details');
                const envData: DevelopmentEnvironment = await envRes.json();
                setEnvironment(envData);
                
                const products = await productsRes.json();
                const specifications = await specsRes.json();
                const baselines = await baselinesRes.json();
                const allTenants = await tenantsRes.json();

                const product = products.find((p: Product) => p._id === envData.productId);
                const specification = specifications.find((s: Specification) => s._id === envData.specificationId);
                const baseline = envData.baselineId ? baselines.find((b: Baseline) => b._id === envData.baselineId) : null;
                const tenants = envData.tenantIds ? allTenants.filter((t: CmdbTenant) => envData.tenantIds.includes(t.id)) : [];
                
                setRelatedData({ product, specification, baseline, tenants });

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, toast]);
    
    const dependencyItems = useMemo(() => {
        if (!relatedData.baseline && relatedData.tenants.length === 0) return [];
        
        let items: any[] = [];
        
        if (relatedData.baseline) {
            items = relatedData.baseline.tenants.flatMap((tenant: any) => [
                { type: 'Tenant', ...tenant },
                ...(tenant.components || []).map((c: any) => ({ type: 'Component', ...c })),
                ...(tenant.applications || []).map((a: any) => ({ type: 'Application', ...a }))
            ]);
        } else {
             items = relatedData.tenants.flatMap((tenant: any) => [
                { type: 'Tenant', ...tenant },
                ...(tenant.components || []).map((c: any) => ({ type: 'Component', ...c })),
                ...(tenant.applications || []).map((a: any) => ({ type: 'Application', ...a }))
            ]);
        }
        
        // Deduplicate
        const uniqueItems = new Map();
        items.forEach(item => {
            const key = `${item.type}-${item.id}`;
            if (!uniqueItems.has(key)) {
                uniqueItems.set(key, item);
            }
        });
        
        return Array.from(uniqueItems.values());
    }, [relatedData]);

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    if (!environment) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">Environment not found.</div></DashboardLayout>;
    }
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{environment.name}</CardTitle>
                                <CardDescription>Viewing development environment details.</CardDescription>
                            </div>
                            <Badge className={cn("text-base", statusColors[environment.status])}>
                                {environment.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Input value={relatedData.product?.name || 'N/A'} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Specification</Label>
                                <Input value={relatedData.specification?.name || 'N/A'} disabled />
                            </div>
                             <div className="space-y-2">
                                <Label>Created By</Label>
                                <Input value={environment.createdBy} disabled />
                            </div>
                             <div className="space-y-2">
                                <Label>Created At</Label>
                                <Input value={format(new Date(environment.createdAt), 'PPP p')} disabled />
                            </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Sourcing</h3>
                                {relatedData.baseline ? (
                                    <div>
                                        <Label>Baseline</Label>
                                        <Input value={`${relatedData.baseline.product.name} v${relatedData.baseline.product.version}`} disabled />
                                    </div>
                                ) : (
                                    <div>
                                        <Label>Manually Selected Tenants ({relatedData.tenants.length})</Label>
                                        <Card className="max-h-40 overflow-y-auto">
                                            <CardContent className="p-2">
                                                {relatedData.tenants.map(t => <div key={t.id} className="p-1">{t.name}</div>)}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Cost & Resources</h3>
                                <Card>
                                    <CardContent className="pt-6 grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Estimated Cost</Label>
                                            <p className="text-2xl font-bold">${environment.estimatedCost?.toFixed(2) || '0.00'} <span className="text-sm font-normal text-muted-foreground">/ hr</span></p>
                                        </div>
                                         <div>
                                            <Label>Resource Summary</Label>
                                            <p className="text-sm">{environment.resourceUsage?.cpu || 'N/A'} CPU</p>
                                            <p className="text-sm">{environment.resourceUsage?.memory || 'N/A'} Memory</p>
                                            <p className="text-sm">{environment.resourceUsage?.storage || 'N/A'} Storage</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                         <div>
                            <h3 className="text-lg font-semibold mb-2">Dependency Summary</h3>
                             <Table>
                                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Version</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {dependencyItems.length > 0 ? dependencyItems.map(item => (
                                         <TableRow key={`${item.type}-${item.id}`}>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {item.type === 'Tenant' && <Warehouse className="mr-1 h-3 w-3"/>}
                                                    {item.type === 'Component' && <Puzzle className="mr-1 h-3 w-3"/>}
                                                    {item.type === 'Application' && <AppWindow className="mr-1 h-3 w-3"/>}
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.version || 'N/A'}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center">No dependencies to show.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.back()}>Back</Button>
                        <Button onClick={() => router.push(`/platform-engineering/development-environments/${id}/edit`)}>Edit</Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
