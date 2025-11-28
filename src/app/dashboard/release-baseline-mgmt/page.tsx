
"use client";
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment, Baseline, Product, CmdbTenant, CmdbComponent, CmdbApplication } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Loader2, Move, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

function Widget({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="cursor-move h-8 w-8">
                        <Move className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">{children}</CardContent>
        </Card>
    );
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    VALIDATING: 'bg-blue-200 text-blue-800',
    VALIDATED: 'bg-indigo-200 text-indigo-800',
    RELEASED: 'bg-green-200 text-green-800',
    ARCHIVED: 'bg-red-200 text-red-800',
    REJECTED: 'bg-red-300 text-red-900',
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    UPGRADE_APPROVAL: 'bg-orange-200 text-orange-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
};

export default function ReleaseBaselineMgmtPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Data states
    const [products, setProducts] = useState<Product[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [components, setComponents] = useState<CmdbComponent[]>([]);
    const [applications, setApplications] = useState<CmdbApplication[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);

    useEffect(() => {
        getUser().then(u => setUser(u as any));
        setLoading(true);
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/cmdb/tenants').then(r => r.json()),
            fetch('/api/cmdb/components').then(r => r.json()),
            fetch('/api/cmdb/applications').then(r => r.json()),
            fetch('/api/baselines').then(r => r.json()),
            fetch('/api/deployments').then(r => r.json()),
        ])
        .then(([productsData, tenantsData, componentsData, applicationsData, baselinesData, deploymentsData]) => {
            setProducts(productsData);
            setTenants(tenantsData);
            setComponents(componentsData);
            setApplications(applicationsData);
            setBaselines(baselinesData);
            setDeployments(deploymentsData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const baselineStatusCounts = baselines.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const baselineStatusData = Object.entries(baselineStatusCounts).map(([name, value]) => ({ name, value }));
    const baselineChartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    const deploymentStatusCounts = deployments.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const deploymentStatusData = Object.entries(deploymentStatusCounts).map(([name, value]) => ({ name, value }));

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 space-y-8 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Release & Baseline Management</h1>
                    <p className="mt-2 text-muted-foreground">Monitor your baselines, deployments, and overall release health.</p>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card><CardHeader className="pb-2"><CardDescription>Products</CardDescription><CardTitle className="text-4xl">{products.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Tenants</CardDescription><CardTitle className="text-4xl">{tenants.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Components</CardDescription><CardTitle className="text-4xl">{components.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Applications</CardDescription><CardTitle className="text-4xl">{applications.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Baselines</CardDescription><CardTitle className="text-4xl">{baselines.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Deployments</CardDescription><CardTitle className="text-4xl">{deployments.length}</CardTitle></CardHeader></Card>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Widget title="Baselines by Status" description="Current distribution of all baselines.">
                        {loading ? <div className="h-60 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                            <ChartContainer config={{}} className="min-h-[240px]">
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                        <Pie data={baselineStatusData} dataKey="value" nameKey="name" innerRadius={50}>
                                            {baselineStatusData.map((entry, idx) => (
                                                <Cell key={`cell-${idx}`} fill={baselineChartColors[idx % baselineChartColors.length]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </Widget>
                     <Widget title="Deployments by Status" description="Current status of all active deployments.">
                        {loading ? <div className="h-60 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                            <ChartContainer config={{ value: { label: 'Count' } }} className="min-h-[240px]">
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={deploymentStatusData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis />
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </Widget>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Widget title="Recent Baselines" description="The last 5 baselines that were created or updated.">
                        <Table>
                            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Version</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {loading ? <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                                : baselines.slice(0, 5).map(b => (
                                    <TableRow key={b._id}>
                                        <TableCell>
                                            <Link href={`/release-management/baseline/${b._id}/summary`} className="font-medium hover:underline">{b.product.name}</Link>
                                        </TableCell>
                                        <TableCell>{b.product.version}</TableCell>
                                        <TableCell><Badge className={cn(statusColors[b.status] || 'bg-gray-200')}>{b.status}</Badge></TableCell>
                                        <TableCell>{format(new Date(b.updated_at), 'PPP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Widget>
                     <Widget title="Recent Deployments" description="The last 5 deployments that were created or updated.">
                         <Table>
                            <TableHeader><TableRow><TableHead>Deployment ID</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {loading ? <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                                : deployments.slice(0, 5).map(d => (
                                    <TableRow key={d._id}>
                                        <TableCell>
                                            <Link href={`/fleet-management/deployment/${d._id}/view`} className="font-medium hover:underline font-mono text-xs">{d.details.deploymentId}</Link>
                                        </TableCell>
                                        <TableCell>{d.details.customer}</TableCell>
                                        <TableCell><Badge className={cn(statusColors[d.status] || 'bg-gray-200')}>{d.status}</Badge></TableCell>
                                        <TableCell>{format(new Date(d.createdAt), 'PPP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Widget>
                </div>
            </main>
        </DashboardLayout>
    );
}
