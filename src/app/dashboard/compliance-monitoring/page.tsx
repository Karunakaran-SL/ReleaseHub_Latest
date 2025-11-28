
'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Product, Deployment } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, BarChart, Bar, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Loader2, Move, Trash2, CheckCircle, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, subDays, parseISO } from 'date-fns';

interface ComplianceEvent {
    id: string;
    description: string;
    status: 'Passed' | 'Failed' | 'Remediation Required';
    control: 'SOC 2' | 'ISO 27001' | 'GDPR' | 'PCI DSS';
    timestamp: string;
    productName: string;
}

const generateDummyEvents = (products: Product[]): ComplianceEvent[] => {
    const controls: ComplianceEvent['control'][] = ['SOC 2', 'ISO 27001', 'GDPR', 'PCI DSS'];
    const statuses: ComplianceEvent['status'][] = ['Passed', 'Failed', 'Remediation Required', 'Passed', 'Passed'];
    if (products.length === 0) return [];
    return Array.from({ length: 20 }, (_, i) => ({
        id: `CE-${3000 + i}`,
        description: `Control ${controls[i % controls.length]}-1.2.${i%5 + 1} validation for ${products[i % products.length].name}`,
        status: statuses[i % statuses.length],
        control: controls[i % controls.length],
        timestamp: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
        productName: products[i % products.length].name,
    }));
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

export default function ComplianceMonitoringDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [events, setEvents] = useState<ComplianceEvent[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const productsRes = await fetch('/api/products');
                const productsData = await productsRes.json();
                setProducts(productsData);
                setEvents(generateDummyEvents(productsData));
            } catch (error) {
                console.error("Failed to fetch initial data for compliance dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    
    const complianceByStandardData = useMemo(() => {
        const counts = events.reduce((acc, event) => {
            if (!acc[event.control]) {
                acc[event.control] = { passed: 0, total: 0 };
            }
            acc[event.control].total++;
            if (event.status === 'Passed') {
                acc[event.control].passed++;
            }
            return acc;
        }, {} as Record<string, { passed: number, total: number }>);

        return Object.entries(counts).map(([name, data]) => ({
            name,
            compliance: data.total > 0 ? (data.passed / data.total) * 100 : 0
        }));
    }, [events]);

    const controlStatusData = useMemo(() => {
        const counts = events.reduce((acc, event) => {
            acc[event.status] = (acc[event.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [events]);
    
    const overallCompliance = complianceByStandardData.length > 0 ? complianceByStandardData.reduce((acc, curr) => acc + curr.compliance, 0) / complianceByStandardData.length : 0;
    
    const chartColors = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))', 'hsl(var(--chart-4))'];

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 space-y-8 p-6 md:p-10">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Monitoring Dashboard</h1>
                    <p className="mt-2 text-muted-foreground">Track adherence to regulatory standards and internal policies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardDescription>Overall Compliance</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{overallCompliance.toFixed(1)}% <ShieldCheck className="h-8 w-8 text-green-500" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Controls Passed</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{events.filter(e => e.status === 'Passed').length} <CheckCircle className="h-8 w-8 text-green-500"/></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Remediations Required</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{events.filter(e => e.status === 'Remediation Required').length} <AlertTriangle className="h-8 w-8 text-yellow-500" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Total Controls</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{events.length} <Scale className="h-8 w-8 text-muted-foreground" /></CardTitle></CardHeader></Card>
                </div>
                
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Widget title="Compliance by Standard">
                        <ChartContainer config={{ compliance: { label: 'Compliance %' }}} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={complianceByStandardData} layout="vertical">
                                    <CartesianGrid horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}/>
                                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="compliance" fill="hsl(var(--chart-1))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                     <Widget title="Control Status Overview">
                        <ChartContainer config={{}} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                    <Pie data={controlStatusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                        {controlStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                      <Widget title="Product Compliance">
                        <ChartContainer config={{ compliance: { label: 'Compliance %' }}} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={products.slice(0, 5).map(p => ({ name: p.name, compliance: Math.floor(Math.random() * 40) + 60}))}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} interval={0}/>
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="compliance" fill="hsl(var(--chart-2))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                 </div>
                 
                 <Card>
                    <CardHeader><CardTitle>Recent Compliance Activity</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Control</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.slice(0, 10).map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.control}</TableCell>
                                        <TableCell>{event.description}</TableCell>
                                        <TableCell>{event.productName}</TableCell>
                                        <TableCell>
                                            <Badge variant={event.status === 'Failed' ? 'destructive' : (event.status === 'Remediation Required' ? 'default' : 'secondary')}
                                                className={event.status === 'Remediation Required' ? 'bg-yellow-200 text-yellow-800' : ''}
                                            >
                                                {event.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDistanceToNow(parseISO(event.timestamp), { addSuffix: true })}</TableCell>
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

