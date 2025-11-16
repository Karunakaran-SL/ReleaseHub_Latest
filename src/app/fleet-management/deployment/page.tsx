
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Deployment, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { PlusCircle, Upload, GitMerge, Trash2, Loader2, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const DeploymentMap = dynamic(() => import('./_components/deployment-map'), {
    ssr: false,
    loading: () => <div className="h-96 bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});


const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    UPGRADE_APPROVAL: 'bg-orange-200 text-orange-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
};

export default function DeploymentDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [products, setProducts] = useState<Record<string, Product>>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            try {
                const [deploymentsRes, productsRes] = await Promise.all([
                    fetch('/api/deployments'),
                    fetch('/api/products')
                ]);
                if (!deploymentsRes.ok || !productsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                const deploymentsData = await deploymentsRes.json();
                const productsData = await productsRes.json();
                setDeployments(deploymentsData);
                setProducts(productsData.reduce((acc: any, p: Product) => ({ ...acc, [p._id]: p }), {}));
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Deployment Dashboard</h1>
                        <p className="text-muted-foreground">Centralized view of all worldwide deployments.</p>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="secondary" asChild>
                           <Link href="/fleet-management/deployment/upgrades">
                                <List className="mr-2 h-4 w-4" /> View Upgrade Status
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/fleet-management/deployment/upgrade">
                                <Upload className="mr-2 h-4 w-4" /> Upgrade Wizard
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/fleet-management/deployment/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> New Deployment Wizard
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/fleet-management/deployment/migration">
                                <GitMerge className="mr-2 h-4 w-4" /> Migration Wizard
                            </Link>
                        </Button>
                        <Button variant="destructive" asChild>
                            <Link href="/fleet-management/deployment/decommission">
                                <Trash2 className="mr-2 h-4 w-4" /> Decommission Wizard
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-1 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Global Deployment View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[60vh] bg-muted rounded-md flex items-center justify-center">
                                <DeploymentMap deployments={deployments} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Recent Deployments</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deployment ID</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                                ) : deployments.length > 0 ? (
                                    deployments.map(dep => (
                                        <TableRow key={dep._id}>
                                            <TableCell className="font-mono">
                                                <Link href={`/fleet-management/deployment/${dep._id}/view`} className="hover:underline">
                                                    {dep.details.deploymentId}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{products[dep.productId]?.name || dep.productId}</TableCell>
                                            <TableCell>{dep.details.customer}</TableCell>
                                            <TableCell>{dep.details.country || 'N/A'}</TableCell>
                                            <TableCell>{format(new Date(dep.createdAt), 'PPP')}</TableCell>
                                            <TableCell>
                                                <Badge className={cn(statusColors[dep.status] || 'bg-gray-200')}>
                                                    {dep.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={6} className="text-center">No deployments found.</TableCell></TableRow>
                                )}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>

            </main>
        </DashboardLayout>
    );
}
