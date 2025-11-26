'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User, Deployment, DevelopmentEnvironment } from '@/lib/definitions';
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
import { Pie, PieChart, Cell } from 'recharts';
import { Rocket, CheckCircle, TerminalSquare, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Page() {
    const [user, setUser] = useState<User | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [devEnvs, setDevEnvs] = useState<DevelopmentEnvironment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    async function fetchData() {
        setLoading(true);
        try {
            const [deploymentsRes, devEnvsRes] = await Promise.all([
                fetch('/api/deployments'),
                fetch('/api/development-environments'),
            ]);

            if (deploymentsRes.ok) {
                const deploymentsData = await deploymentsRes.json();
                setDeployments(deploymentsData);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch deployments." });
            }

            if (devEnvsRes.ok) {
                const devEnvsData = await devEnvsRes.json();
                setDevEnvs(devEnvsData);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch development environments." });
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
        totalDeployments: deployments.length,
        activeDeployments: deployments.filter(d => d.status === 'ACTIVE').length,
        totalDevEnvs: devEnvs.length,
        readyDevEnvs: devEnvs.filter(e => e.status === 'READY').length,
    }), [deployments, devEnvs]);

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
                <h1 className="text-3xl font-bold tracking-tight">Fleet Management Dashboard</h1>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Dev Environments</CardTitle>
                            <TerminalSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.totalDevEnvs}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ready Dev Environments</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.readyDevEnvs}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Deployments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deployment ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Country</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deployments.slice(0, 5).map((deployment) => (
                                        <TableRow key={deployment._id}>
                                            <TableCell className="font-mono text-xs">{deployment.details.deploymentId}</TableCell>
                                            <TableCell>{deployment.details.customer}</TableCell>
                                            <TableCell><Badge variant={deployment.status === 'ACTIVE' ? 'default' : 'secondary'}>{deployment.status}</Badge></TableCell>
                                            <TableCell>{deployment.details.country}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Development Environments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>CPU</TableHead>
                                    <TableHead>Memory</TableHead>
                                    <TableHead>Storage</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devEnvs.map((env) => (
                                    <TableRow key={env._id}>
                                        <TableCell>{env.name}</TableCell>
                                        <TableCell>{env.productName || env.productId}</TableCell>
                                        <TableCell><Badge variant={env.status === 'READY' ? 'default' : 'secondary'}>{env.status}</Badge></TableCell>
                                        <TableCell>{env.resourceUsage?.cpu || 'N/A'}</TableCell>
                                        <TableCell>{env.resourceUsage?.memory || 'N/A'}</TableCell>
                                        <TableCell>{env.resourceUsage?.storage || 'N/A'}</TableCell>
                                        <TableCell>{new Date(env.createdAt).toLocaleDateString()}</TableCell>
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