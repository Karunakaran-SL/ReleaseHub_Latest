'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User, Baseline, Deployment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '../../dashboard-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell } from 'recharts';
import { FileCode, Rocket, CheckCircle, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Page() {
    const [user, setUser] = useState<User | null>(null);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    async function fetchData() {
        setLoading(true);
        try {
            const [baselinesRes, deploymentsRes] = await Promise.all([
                fetch('/api/baselines'),
                fetch('/api/deployments'),
            ]);

            if (baselinesRes.ok) {
                const baselinesData = await baselinesRes.json();
                setBaselines(baselinesData);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch baselines." });
            }

            if (deploymentsRes.ok) {
                const deploymentsData = await deploymentsRes.json();
                setDeployments(deploymentsData);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch deployments." });
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching data." });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getUser().then(setUser);
        fetchData();
    }, []);

    const summaryStats = useMemo(() => ({
        totalBaselines: baselines.length,
        draftBaselines: baselines.filter(b => b.status === 'DRAFT').length,
        totalDeployments: deployments.length,
        activeDeployments: deployments.filter(d => d.status === 'ACTIVE').length,
    }), [baselines, deployments]);

    const deploymentsByCountry = useMemo(() => {
        const counts = deployments.reduce((acc, d) => {
            const country = d.details.country || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [deployments]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];


    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-8 p-6 md:p-10">
                <h1 className="text-3xl font-bold tracking-tight">Release & Baseline Dashboard</h1>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Baselines</CardTitle>
                            <FileCode className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.totalBaselines}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft Baselines</CardTitle>
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.draftBaselines}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
                            <Rocket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.totalDeployments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.activeDeployments}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Baselines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {baselines.slice(0, 5).map((baseline) => (
                                        <TableRow key={baseline._id}>
                                            <TableCell>{baseline.product.name}</TableCell>
                                            <TableCell>{baseline.product.version}</TableCell>
                                            <TableCell><Badge>{baseline.status}</Badge></TableCell>
                                            <TableCell>{new Date(baseline.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Deployments by Country</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="h-64 w-full">
                                <PieChart>
                                    <Pie data={deploymentsByCountry} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                        {deploymentsByCountry.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Deployments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deployment ID</TableHead>
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deployments.slice(0, 5).map((deployment) => (
                                    <TableRow key={deployment._id}>
                                        <TableCell className="font-mono text-xs">{deployment.details.deploymentId}</TableCell>
                                        <TableCell>{deployment.productId}</TableCell>
                                        <TableCell><Badge variant={deployment.status === 'ACTIVE' ? 'default' : 'secondary'}>{deployment.status}</Badge></TableCell>
                                        <TableCell>{deployment.details.customer}</TableCell>
                                        <TableCell>{new Date(deployment.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}