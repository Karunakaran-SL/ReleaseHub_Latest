
'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, BarChart, Bar, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Loader2, Move, Trash2, Clock, CheckCircle, AlertTriangle, Workflow, Play, Pause, PowerOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, subDays, parseISO } from 'date-fns';

interface WorkflowRun {
    id: string;
    name: string;
    status: 'Running' | 'Completed' | 'Failed' | 'Paused';
    duration: number;
    startedAt: string; // Changed from Date to string
}

const generateDummyWorkflows = (): WorkflowRun[] => {
    const names = ['User Onboarding', 'Nightly Data Sync', 'Invoice Processing', 'Security Scan', 'Customer Report Generation', 'Deployment Pipeline'];
    const statuses: WorkflowRun['status'][] = ['Running', 'Completed', 'Failed', 'Paused', 'Completed', 'Completed'];
    return Array.from({ length: 20 }, (_, i) => ({
        id: `run-${1001 + i}`,
        name: names[i % names.length],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        duration: Math.floor(Math.random() * 3600) + 60, // 1 minute to 1 hour
        startedAt: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString(), // Convert to string
    }));
};

const statusConfig = {
    Running: { color: 'bg-blue-500', icon: <Play className="h-3 w-3" /> },
    Completed: { color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
    Failed: { color: 'bg-red-500', icon: <AlertTriangle className="h-3 w-3" /> },
    Paused: { color: 'bg-yellow-500', icon: <Pause className="h-3 w-3" /> },
};


function Widget({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="cursor-move h-8 w-8"><Move className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">{children}</CardContent>
        </Card>
    );
}

export default function WorkflowManagementDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser().then(setUser);
        // Simulate fetching data
        setTimeout(() => {
            setWorkflows(generateDummyWorkflows());
            setLoading(false);
        }, 1000);
    }, []);

    const workflowStatusData = useMemo(() => {
        const counts = workflows.reduce((acc, wf) => {
            acc[wf.status] = (acc[wf.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [workflows]);

    const executionsOverTimeData = useMemo(() => {
        const data: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i);
            data[d.toISOString().split('T')[0]] = 0;
        }
        workflows.forEach(wf => {
            const day = wf.startedAt.split('T')[0];
            if (data[day] !== undefined) {
                data[day]++;
            }
        });
        return Object.entries(data).map(([day, count]) => ({ day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count }));
    }, [workflows]);
    
    const avgDurationData = useMemo(() => {
        const grouped = workflows.reduce((acc, wf) => {
            if (!acc[wf.name]) {
                acc[wf.name] = { totalDuration: 0, count: 0 };
            }
            acc[wf.name].totalDuration += wf.duration;
            acc[wf.name].count++;
            return acc;
        }, {} as Record<string, { totalDuration: number, count: number }>);
        return Object.entries(grouped).map(([name, data]) => ({ name, avgDuration: Math.round(data.totalDuration / data.count / 60) }));
    }, [workflows]);

    const successRate = workflows.length > 0 ? (workflows.filter(wf => wf.status === 'Completed').length / workflows.length) * 100 : 0;
    const avgDurationOverall = workflows.length > 0 ? workflows.reduce((acc, wf) => acc + wf.duration, 0) / workflows.length : 0;

    const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 space-y-8 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workflow Management Dashboard</h1>
                    <p className="mt-2 text-muted-foreground">Monitor and manage your automated business processes and data pipelines.</p>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardDescription>Total Workflows</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{workflows.length} <Workflow className="h-8 w-8 text-muted-foreground" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Active Now</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{workflows.filter(w => w.status === 'Running').length} <Play className="h-8 w-8 text-blue-500"/></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Success Rate (24h)</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{successRate.toFixed(1)}% <CheckCircle className="h-8 w-8 text-green-500" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Avg. Duration</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{(avgDurationOverall / 60).toFixed(1)} min <Clock className="h-8 w-8 text-muted-foreground" /></CardTitle></CardHeader></Card>
                </div>
                
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     <Widget title="Workflow Status Overview">
                        <ChartContainer config={{}} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                    <Pie data={workflowStatusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                         {workflowStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                     <Widget title="Avg. Workflow Duration (Minutes)">
                         <ChartContainer config={{ avgDuration: { label: 'Minutes' } }} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={avgDurationData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} interval={0} angle={-30} textAnchor="end" height={60} />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="avgDuration" fill="hsl(var(--chart-2))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                     <Widget title="Executions (Last 7 Days)">
                        <ChartContainer config={{ count: { label: 'Executions' } }} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={executionsOverTimeData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-1))" fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                 </div>
                 
                 <Card>
                    <CardHeader><CardTitle>Recent Workflow Runs</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Workflow</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Started</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workflows.slice(0, 10).map(wf => (
                                    <TableRow key={wf.id}>
                                        <TableCell className="font-medium">{wf.name}</TableCell>
                                        <TableCell>
                                            <Badge style={{ backgroundColor: statusConfig[wf.status].color }} className="text-white flex items-center gap-1 w-28 justify-center">
                                                {statusConfig[wf.status].icon} {wf.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{(wf.duration / 60).toFixed(1)} min</TableCell>
                                        <TableCell>{formatDistanceToNow(parseISO(wf.startedAt), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">View Details</Button>
                                        </TableCell>
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
