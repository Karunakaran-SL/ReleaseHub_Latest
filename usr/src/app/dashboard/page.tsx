
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart as BarChartIcon, List, CheckCircle, Package, Move, Trash2 } from 'lucide-react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment, Product, Baseline } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const DeploymentMap = dynamic(() => import('@/app/fleet-management/deployment/_components/deployment-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

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

function GlobalViewWidget() {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/deployments')
            .then(res => res.json())
            .then(data => {
                setDeployments(data);
                setLoading(false);
            });
    }, []);

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

function ProductTenantChart({ products }: { products: Product[] }) {
    // This widget requires tenant data, which is not being fetched here.
    // For now, it will remain as a placeholder or we need to fetch tenant data.
    // Let's make it a placeholder for now to avoid additional API calls.
    const productTenantData = products.slice(0, 4).map(p => ({
        name: p.name,
        tenants: Math.floor(Math.random() * 10) + 1, // Dummy data
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

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            try {
                const [deploymentsRes, productsRes, baselinesRes] = await Promise.all([
                    fetch('/api/deployments'),
                    fetch('/api/products'),
                    fetch('/api/baselines')
                ]);
                setDeployments(await deploymentsRes.json());
                setProducts(await productsRes.json());
                setBaselines(await baselinesRes.json());
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
        <div className="space-y-6">
            <GlobalViewWidget />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <DeploymentStatusPieChart deployments={deployments} loading={loading} />
                <BaselineComplianceChart baselines={baselines} loading={loading}/>
                <ProductDeploymentChart deployments={deployments} products={products} loading={loading} />
                <ProductTenantChart products={products} />
            </div>
        </div>
        </main>
    </DashboardLayout>
  );
}
