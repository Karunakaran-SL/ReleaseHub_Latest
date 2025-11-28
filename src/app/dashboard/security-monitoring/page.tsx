
'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Product, Deployment } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, BarChart, Bar, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Loader2, Move, Trash2, Shield, Bug, AlertTriangle, GitPullRequest, Code, Eye, ShieldCheck, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, subDays, parseISO } from 'date-fns';

interface SecurityIncident {
    id: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Resolved';
    detectedAt: string;
    deploymentId: string;
}

const generateDummyIncidents = (deployments: Deployment[]): SecurityIncident[] => {
    const descriptions = [
        'SQL Injection attempt detected', 'Cross-Site Scripting (XSS) vulnerability found', 'Unsecured S3 bucket discovered',
        'Anomalous login activity from new IP', 'High-severity CVE in a core library', 'Data exfiltration pattern detected'
    ];
    const severities: SecurityIncident['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
    const statuses: SecurityIncident['status'][] = ['Open', 'In Progress', 'Resolved'];
    
    if (deployments.length === 0) return [];

    return Array.from({ length: 15 }, (_, i) => ({
        id: `INC-${2000 + i}`,
        description: descriptions[i % descriptions.length],
        severity: severities[i % severities.length],
        status: statuses[i % statuses.length],
        detectedAt: subDays(new Date(), Math.floor(Math.random() * 14)).toISOString(),
        deploymentId: deployments[i % deployments.length]._id,
    }));
};

const vulnerabilityData = [
  { severity: 'Critical', count: 12 },
  { severity: 'High', count: 45 },
  { severity: 'Medium', count: 128 },
  { severity: 'Low', count: 350 },
];

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

export default function SecurityMonitoringDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [deploymentsRes, productsRes] = await Promise.all([
                    fetch('/api/deployments'),
                    fetch('/api/products')
                ]);
                const deploymentsData = await deploymentsRes.json();
                setDeployments(deploymentsData);
                setProducts(await productsRes.json());
                setIncidents(generateDummyIncidents(deploymentsData));
            } catch (error) {
                console.error("Failed to fetch initial data for security dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const complianceData = useMemo(() => {
        return products.map(product => ({
            name: product.name,
            compliance: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        }));
    }, [products]);
    
    const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 space-y-8 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Monitoring Dashboard</h1>
                    <p className="mt-2 text-muted-foreground">An overview of your security posture across all applications and deployments.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardDescription>Critical Vulnerabilities</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{vulnerabilityData[0].count} <Bug className="h-8 w-8 text-red-500" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Open Incidents</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{incidents.filter(i => i.status === 'Open').length} <AlertTriangle className="h-8 w-8 text-yellow-500"/></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Compliance Score</CardDescription><CardTitle className="text-4xl flex items-center gap-2">{complianceData.length > 0 ? (complianceData.reduce((acc, p) => acc + p.compliance, 0) / complianceData.length).toFixed(1) : 'N/A'}% <ShieldCheck className="h-8 w-8 text-green-500" /></CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Code Scans (24h)</CardDescription><CardTitle className="text-4xl flex items-center gap-2">1,204 <Code className="h-8 w-8 text-muted-foreground" /></CardTitle></CardHeader></Card>
                </div>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     <Widget title="Vulnerabilities by Severity">
                        <ChartContainer config={{}} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent nameKey="severity" />} />
                                    <Pie data={vulnerabilityData} dataKey="count" nameKey="severity" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {vulnerabilityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                     <Widget title="Compliance by Product">
                         <ChartContainer config={{ compliance: { label: 'Compliance %' } }} className="min-h-[250px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={complianceData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} interval={0}/>
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="compliance" fill="hsl(var(--chart-2))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                     </Widget>
                     <Widget title="Security KPIs">
                         <div className="space-y-4 h-full flex flex-col justify-around">
                            <div className="flex items-center">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-4"/>
                                <div>
                                    <p className="font-semibold">99.8%</p>
                                    <p className="text-sm text-muted-foreground">Secure Deployments</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <GitPullRequest className="h-6 w-6 text-blue-500 mr-4"/>
                                <div>
                                    <p className="font-semibold">32</p>
                                    <p className="text-sm text-muted-foreground">Code-Security PRs Merged</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Eye className="h-6 w-6 text-indigo-500 mr-4"/>
                                <div>
                                    <p className="font-semibold">95%</p>
                                    <p className="text-sm text-muted-foreground">Hotspots Reviewed</p>
                                </div>
                            </div>
                         </div>
                     </Widget>
                 </div>

                 <Card>
                    <CardHeader><CardTitle>Recent Security Incidents</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Deployment</TableHead>
                                    <TableHead>Detected At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incidents.slice(0, 5).map(inc => (
                                    <TableRow key={inc.id}>
                                        <TableCell className="font-medium">{inc.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={inc.severity === 'Critical' || inc.severity === 'High' ? 'destructive' : 'default'}>{inc.severity}</Badge>
                                        </TableCell>
                                        <TableCell>{inc.status}</TableCell>
                                        <TableCell>{inc.deploymentId}</TableCell>
                                        <TableCell>{formatDistanceToNow(parseISO(inc.detectedAt), { addSuffix: true })}</TableCell>
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
