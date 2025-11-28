
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Move, Trash2, Rocket, FileCode, Users, HardDrive, Puzzle, AppWindow, GitGraph } from 'lucide-react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment, Product, Baseline, CmdbTenant, CmdbComponent, CmdbApplication, Specification } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

const DeploymentMap = dynamic(() => import('@/app/fleet-management/deployment/_components/deployment-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

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

function Widget({ title, children, description }: { title: string, children: React.ReactNode, description?: string }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className='flex-row items-center justify-between'>
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
            <CardContent className="flex-1">
                {children}
            </CardContent>
        </Card>
    )
}

function GlobalViewWidget({ deployments, loading }: { deployments: Deployment[], loading: boolean }) {
    return (
        <Widget title="Global View" description="Worldwide operational status of all deployments.">
            <div className="h-[60vh]">
                {loading ? <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : <DeploymentMap deployments={deployments} />}
            </div>
        </Widget>
    );
}

const chartConfig = {
  active: { label: 'Active', color: 'hsl(var(--chart-2))' },
  upgrading: { label: 'Upgrading', color: 'hsl(var(--chart-3))' },
  provisioning: { label: 'Provisioning', color: 'hsl(var(--chart-4))' },
  failed: { label: 'Failed', color: 'hsl(var(--chart-1))' },
  decommissioned: { label: 'Decommissioned', color: 'hsl(var(--chart-5))' },
  compliant: { label: 'Compliant', color: 'hsl(var(--chart-2))' },
  noncompliant: { label: 'Non-Compliant', color: 'hsl(var(--chart-1))' },
  unknown: { label: 'Unknown', color: 'hsl(var(--chart-5))' },
  tenants: { label: 'Tenants', color: 'hsl(var(--chart-2))' },
};

function DeploymentStatusPieChart({ deployments, loading }: { deployments: Deployment[], loading: boolean }) {
  const deploymentStatusData = Object.entries(
    deployments.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <Widget title="Deployments by Status">
      {loading ? (
          <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={deploymentStatusData} dataKey="value" nameKey="name" >
                        {deploymentStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={`var(--color-${entry.name.toLowerCase()})`} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
      )}
    </Widget>
  );
}

function BaselineComplianceChart({ baselines, loading }: { baselines: Baseline[], loading: boolean }) {
    const complianceData = baselines.reduce((acc, b) => {
        const status = b.status === 'RELEASED' ? 'Compliant' : 'Non-Compliant';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const baselineComplianceData = Object.entries(complianceData).map(([name, value]) => ({ name, value, fill: name === 'Compliant' ? 'var(--color-compliant)' : 'var(--color-noncompliant)' }));

    return (
        <Widget title="Baseline Compliance">
             {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
             ) : (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={baselineComplianceData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" layout="vertical" radius={5}>
                                {baselineComplianceData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
             )}
        </Widget>
    );
}

function ProductDeploymentChart({ deployments, products, loading }: { deployments: Deployment[], products: Product[], loading: boolean }) {
    const productDeploymentData = products.map(product => {
        const productDeployments = deployments.filter(d => d.productId === product._id);
        return {
            name: product.name,
            active: productDeployments.filter(d => d.status === 'ACTIVE').length,
            upgrading: productDeployments.filter(d => d.status === 'UPGRADING').length,
            failed: productDeployments.filter(d => d.status === 'FAILED').length,
        };
    });

    return (
        <Widget title="Deployments by Product">
             {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
             ) : (
                 <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={productDeploymentData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="active" stackId="a" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="upgrading" stackId="a" fill="var(--color-upgrading)" />
                            <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
             )}
        </Widget>
    )
}

function ProductTenantChart({ products, tenants }: { products: Product[], tenants: CmdbTenant[] }) {
    const productTenantData = products.map(p => ({
        name: p.name,
        tenants: tenants.filter(t => t.products?.some(prod => prod.id === p._id)).length
    }));

    return (
        <Widget title="Tenants per Product">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={productTenantData}>
                         <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="tenants" fill="var(--color-tenants)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </Widget>
    )
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [components, setComponents] = useState<CmdbComponent[]>([]);
    const [applications, setApplications] = useState<CmdbApplication[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [deploymentsRes, productsRes, baselinesRes, tenantsRes, componentsRes, applicationsRes, specificationsRes] = await Promise.all([
                    fetch('/api/deployments'),
                    fetch('/api/products'),
                    fetch('/api/baselines'),
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications'),
                    fetch('/api/specifications'),
                ]);
                setDeployments(await deploymentsRes.json());
                setProducts(await productsRes.json());
                setBaselines(await baselinesRes.json());
                setTenants(await tenantsRes.json());
                setComponents(await componentsRes.json());
                setApplications(await applicationsRes.json());
                setSpecifications(await specificationsRes.json());
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

  return (
    <DashboardLayout user={user}>
        <main className="flex-1 space-y-8 p-6 md:p-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="mt-2 text-muted-foreground">Your central hub for monitoring and managing all operations.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card><CardHeader className="pb-2"><CardDescription>Products</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : products.length}</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Tenants</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : tenants.length}</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Components</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : components.length}</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Applications</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : applications.length}</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Baselines</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : baselines.length}</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Deployments</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : deployments.length}</CardTitle></CardHeader></Card>
            </div>

            <div className="space-y-6">
                <GlobalViewWidget deployments={deployments} loading={loading} />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <DeploymentStatusPieChart deployments={deployments} loading={loading} />
                    <BaselineComplianceChart baselines={baselines} loading={loading}/>
                    <ProductDeploymentChart deployments={deployments} products={products} loading={loading} />
                    <ProductTenantChart products={products} tenants={tenants} />
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
                                        <TableCell>{format(parseISO(b.updated_at), 'PPP')}</TableCell>
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
                                        <TableCell>{format(parseISO(d.createdAt), 'PPP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Widget>
                </div>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Widget title="Product vs Specs">
                        <ChartContainer config={{ count: { label: 'Specifications' } }} className="min-h-[200px] w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={products.map(p => ({ name: p.name, count: p.specifications?.length || 0}))}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={false} />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Widget>
                    <Widget title="Product vs Compliance">
                        <ChartContainer config={{ count: { label: 'Checks' } }} className="min-h-[200px] w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={products.map(p => ({ name: p.name, count: p.compliance_checks?.length || 0}))}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={false} />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Widget>
                    <Widget title="Dependency Graph">
                         <div className="h-full flex flex-col items-center justify-center text-center">
                            <GitGraph className="h-16 w-16 text-muted-foreground" />
                            <p className="text-muted-foreground mt-4">Navigate to Dependency Metrics to explore the detailed graph.</p>
                            <Button asChild variant="link" className="mt-2"><Link href="/dependency-metrics">Explore Dependencies</Link></Button>
                         </div>
                    </Widget>
                </div>
            </div>
        </main>
    </DashboardLayout>
  );
}
