
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, DevelopmentEnvironment, Product, Specification, Baseline, CmdbTenant, CmdbComponent, CmdbApplication } from '@/lib/definitions';
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

const iconMap = {
    Tenant: <Warehouse className="h-4 w-4" />,
    Component: <Puzzle className="h-4 w-4" />,
    Application: <AppWindow className="h-4 w-4" />,
};

function DependencyItem({ item }: { item: any }) {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    {iconMap[item.type as keyof typeof iconMap]}
                    <span>{item.type}</span>
                </div>
            </TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.version || 'N/A'}</TableCell>
        </TableRow>
    );
}

export default function ViewDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [environment, setEnvironment] = useState<DevelopmentEnvironment | null>(null);
    const [loading, setLoading] = useState(true);
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
                const res = await fetch(`/api/development-environments/${id}`);
                if (!res.ok) throw new Error('Failed to fetch environment details');
                const data: DevelopmentEnvironment = await res.json();
                setEnvironment(data);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
                setEnvironment(null);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, toast]);
    
    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    if (!environment) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center p-8 text-center"><p>Could not load environment data. It may have been deleted or an error occurred.</p></div></DashboardLayout>;
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
                                <Input value={environment.productName || 'N/A'} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Specification</Label>
                                <Input value={environment.specName || 'N/A'} disabled />
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
                                {environment.baselineId ? (
                                    <div>
                                        <Label>Baseline</Label>
                                        <Input value={environment.baselineId || 'N/A'} disabled />
                                    </div>
                                ) : (
                                    <div>
                                        <Label>Manually Selected Tenants ({environment.tenantIds?.length || 0})</Label>
                                        <Card className="max-h-40 overflow-y-auto">
                                            <CardContent className="p-2">
                                                {environment.tenantIds?.map(id => <div key={id} className="p-1">{id}</div>)}
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
                                            <p className="text-sm">{environment.resourceUsage?.cpu || 'N/A'}</p>
                                            <p className="text-sm">{environment.resourceUsage?.memory || 'N/A'}</p>
                                            <p className="text-sm">{environment.resourceUsage?.storage || 'N/A'}</p>
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
                                    {environment.dependencySummary && environment.dependencySummary.length > 0 ? environment.dependencySummary.map(item => (
                                         <DependencyItem key={`${item.type}-${item.id}`} item={item} />
                                    )) : <TableRow><TableCell colSpan={3} className="text-center">No dependency summary available.</TableCell></TableRow>}
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
