
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart as BarChartIcon, List, CheckCircle, Package, Move, Trash2 } from 'lucide-react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment } from '@/lib/definitions';
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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetch('/api/deployments')
            .then(res => res.json())
            .then(setDeployments);
    }, []);

    return (
        <Widget title="Global View" description="Worldwide operational status of all deployments.">
            <div className="h-[60vh]">
                {isClient ? <DeploymentMap deployments={deployments} /> : <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            </div>
        </Widget>
    );
}

const deploymentStatusData = [
  { name: 'Active', value: 480, fill: 'var(--color-active)' },
  { name: 'Upgrading', value: 120, fill: 'var(--color-upgrading)' },
  { name: 'Provisioning', value: 80, fill: 'var(--color-provisioning)' },
  { name: 'Failed', value: 35, fill: 'var(--color-failed)' },
];

const baselineComplianceData = [
  { name: 'Compliant', value: 580, fill: 'var(--color-compliant)' },
  { name: 'Non-Compliant', value: 110, fill: 'var(--color-noncompliant)' },
  { name: 'Unknown', value: 25, fill: 'var(--color-unknown)' },
];

const productDeploymentData = [
  { name: 'OneStopShop', active: 250, upgrading: 40, failed: 15 },
  { name: 'Data Fabric', active: 180, upgrading: 60, failed: 10 },
  { name: 'Retail Suite', active: 50, upgrading: 20, failed: 10 },
];

const productTenantData = [
  { name: 'OneStopShop', tenants: 12 },
  { name: 'Data Fabric', tenants: 8 },
  { name: 'Retail Suite', tenants: 5 },
  { name: 'Legacy CRM', tenants: 3 },
];

const chartConfig = {
  active: { label: 'Active', color: 'hsl(var(--chart-2))' },
  upgrading: { label: 'Upgrading', color: 'hsl(var(--chart-3))' },
  provisioning: { label: 'Provisioning', color: 'hsl(var(--chart-4))' },
  failed: { label: 'Failed', color: 'hsl(var(--chart-1))' },
  compliant: { label: 'Compliant', color: 'hsl(var(--chart-2))' },
  noncompliant: { label: 'Non-Compliant', color: 'hsl(var(--chart-1))' },
  unknown: { label: 'Unknown', color: 'hsl(var(--chart-5))' },
  tenants: { label: 'Tenants', color: 'hsl(var(--chart-2))' },
};

function DeploymentStatusPieChart() {
  return (
    <Widget title="Deployments by Status">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={deploymentStatusData} dataKey="value" nameKey="name" />
            </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Widget>
  );
}

function BaselineComplianceChart() {
    return (
        <Widget title="Baseline Compliance">
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
        </Widget>
    );
}

function ProductDeploymentChart() {
    return (
        <Widget title="Deployments by Product">
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
        </Widget>
    )
}

function ProductTenantChart() {
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


export default function DashboardV2Page() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
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
                <DeploymentStatusPieChart />
                <BaselineComplianceChart />
                <ProductDeploymentChart />
                <ProductTenantChart />
            </div>
        </div>
        </main>
    </DashboardLayout>
  );
}
