
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment, Product, UpgradeHistory } from '@/lib/definitions';
import { Loader2, Ship, CheckCircle, AlertTriangle, GitMerge } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DeploymentMap = dynamic(() => import('@/app/fleet-management/deployment/_components/deployment-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    UPGRADE_APPROVAL: 'bg-orange-200 text-orange-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
    SCHEDULED: 'bg-blue-200 text-blue-800',
    COMPLETED: 'bg-green-200 text-green-800',
};

const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function FleetManagementDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [upgradeHistory, setUpgradeHistory] = useState<UpgradeHistory[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [deploymentsRes, productsRes, upgradesRes] = await Promise.all([
                    fetch('/api/deployments'),
                    fetch('/api/products'),
                    fetch('/api/upgrade-history')
                ]);
                if (!deploymentsRes.ok || !productsRes.ok || !upgradesRes.ok) {
                    throw new Error('Failed to fetch dashboard data.');
                }
                setDeployments(await deploymentsRes.json());
                setProducts(await productsRes.json());
                setUpgradeHistory(await upgradesRes.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const deploymentStatusData = Object.entries(
        deployments.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));
    
    const activeDeployments = deployments.filter(d => d.status === 'ACTIVE').length;
    const deploymentsWithIssues = deployments.filter(d => d.status === 'FAILED' || d.status === 'UPGRADE_APPROVAL').length;
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 space-y-8 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fleet Management Dashboard</h1>
                    <p className="mt-2 text-muted-foreground">Monitor the health and status of all your deployments worldwide.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardDescription>Total Deployments</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : deployments.length} <Ship className="h-8 w-8 text-muted-foreground" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : activeDeployments} <CheckCircle className="h-8 w-8 text-green-500"/></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Issues</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : deploymentsWithIssues} <AlertTriangle className="h-8 w-8 text-destructive" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Upgrades Initiated</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : upgradeHistory.length} <GitMerge className="h-8 w-8 text-muted-foreground" /></CardTitle></CardHeader></Card>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle>Global Deployment View</CardTitle></CardHeader>
                        <CardContent><div className="h-[40vh]"><DeploymentMap deployments={deployments} /></div></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Deployments by Status</CardTitle></CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="min-h-[300px] w-full">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                        <Legend />
                                        <Pie data={deploymentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                                            {deploymentStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Upgrade History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Deployments</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Initiated By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto h-6 w-6"/></TableCell></TableRow>
                                ) : upgradeHistory.slice(0, 5).map(h => (
                                    <TableRow key={h._id}>
                                        <TableCell>{format(new Date(h.initiatedAt), 'PPp')}</TableCell>
                                        <TableCell>{products.find(p => p._id === h.productId)?.name || 'Unknown'}</TableCell>
                                        <TableCell>{(h as any).deploymentIds.length}</TableCell>
                                        <TableCell><Badge className={cn(statusColors[h.status])}>{h.status}</Badge></TableCell>
                                        <TableCell>{h.initiatedBy}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
