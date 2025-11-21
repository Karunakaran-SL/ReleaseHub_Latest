'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Deployment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, Download, FileJson } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const generateChartData = (months: number) => {
    return Array.from({ length: months }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (months - 1 - i));
        const max = 60 + Math.random() * 40;
        const avg = max * (Math.random() * 0.4 + 0.3);
        return {
            month: month.toLocaleString('default', { month: 'short' }),
            max: max.toFixed(0),
            avg: avg.toFixed(0),
            p95: (avg * 1.5).toFixed(0),
        };
    });
};

const chartConfig = {
  max: { label: 'Max', color: 'hsl(var(--chart-4))' },
  avg: { label: 'Average', color: 'hsl(var(--chart-2))' },
  p95: { label: '95th Percentile', color: 'hsl(var(--chart-3))' },
};

function UsageChart({ title, data }: { title: string, data: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-avg)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-avg)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-max)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-max)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Area type="monotone" dataKey="avg" stroke="var(--color-avg)" fill="url(#colorAvg)" />
                        <Area type="monotone" dataKey="max" stroke="var(--color-max)" fill="url(#colorMax)" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

const proposedResources = [
    { component: 'AuthN Service', currentCPU: '4 Cores', proposedCPU: '2 Cores', currentMemory: '8 GB', proposedMemory: '4 GB', reason: 'Consistently underutilized.' },
    { component: 'Data Processor', currentCPU: '8 Cores', proposedCPU: '12 Cores', currentMemory: '32 GB', proposedMemory: '48 GB', reason: 'High p95 CPU usage, occasional memory pressure.' },
    { component: 'Retail Storefront', currentCPU: '16 Cores', proposedCPU: '16 Cores', currentMemory: '64 GB', proposedMemory: '64 GB', reason: 'No changes needed, usage is optimal.' },
    { component: 'Inventory Service', currentCPU: '4 Cores', proposedCPU: '4 Cores', currentMemory: '16 GB', proposedMemory: '8 GB', reason: 'Memory over-allocated, low average usage.' },
];

export default function AnalysisWizardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [deployment, setDeployment] = useState<Deployment | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const { toast } = useToast();
    const router = useRouter();
    const { deploymentId } = useParams();

    useEffect(() => {
        getUser().then(setUser);
        if (!deploymentId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Deployment ID is missing.' });
            router.push('/fleet-management/resource-management/details');
            return;
        }

        async function fetchDeployment() {
            try {
                const res = await fetch(`/api/deployments/${deploymentId}`);
                if (!res.ok) throw new Error('Failed to fetch deployment details.');
                setDeployment(await res.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchDeployment();
    }, [deploymentId, router, toast]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    
    const handleDownloadJson = () => {
        const jsonString = JSON.stringify(proposedResources, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resource-proposal-${deployment?.details.deploymentId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Success', description: 'JSON proposal downloaded.' });
    };

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    if (!deployment) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">Deployment not found.</div></DashboardLayout>;
    }

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <UsageChart title="CPU Utilization (%)" data={generateChartData(12)} />
                        <UsageChart title="Memory Usage (%)" data={generateChartData(12)} />
                        <UsageChart title="Storage I/O (%)" data={generateChartData(12)} />
                    </div>
                );
            case 2:
                return (
                     <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resource Optimization Proposal</CardTitle>
                                <CardDescription>Based on historical usage, the following resource adjustments are recommended.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Component</TableHead>
                                            <TableHead>Current CPU</TableHead>
                                            <TableHead>Proposed CPU</TableHead>
                                            <TableHead>Current Memory</TableHead>
                                            <TableHead>Proposed Memory</TableHead>
                                            <TableHead>Reason</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {proposedResources.map(item => (
                                            <TableRow key={item.component}>
                                                <TableCell>{item.component}</TableCell>
                                                <TableCell>{item.currentCPU}</TableCell>
                                                <TableCell className="font-semibold text-green-600">{item.proposedCPU}</TableCell>
                                                <TableCell>{item.currentMemory}</TableCell>
                                                <TableCell className="font-semibold text-green-600">{item.proposedMemory}</TableCell>
                                                <TableCell>{item.reason}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><FileJson /> Downloadable Proposal</CardTitle>
                                <Button size="sm" onClick={handleDownloadJson}><Download className="mr-2 h-4 w-4"/> Download JSON</Button>
                            </CardHeader>
                            <CardContent>
                                <pre className="p-4 rounded-md bg-muted text-sm max-h-96 overflow-auto">
                                    <code>{JSON.stringify(proposedResources, null, 2)}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="max-w-6xl mx-auto">
                    <CardHeader>
                        <CardTitle>Resource Analysis Wizard</CardTitle>
                        <CardDescription>Deployment: {deployment.details.deploymentId} - Step {step} of 2</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[60vh]">
                        {renderStepContent()}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                           <ArrowLeft className="mr-2 h-4 w-4"/> Back
                        </Button>
                        {step === 1 ? (
                            <Button onClick={handleNext}>
                                Next <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        ) : (
                            <Button onClick={() => router.push(`/fleet-management/resource-management/details`)}>
                                Finish
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
