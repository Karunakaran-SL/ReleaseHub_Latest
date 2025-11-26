'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User, Deployment, Baseline } from '@/lib/definitions';
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
import { Check, X, Clock, Globe, Loader2, ListChecks } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ComplianceDeployment } from './_components/compliance-map';
import { useToast } from '@/hooks/use-toast';

const ComplianceMap = dynamic(() => import('./_components/compliance-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

const complianceStatuses: ComplianceDeployment['compliance']['status'][] = ['Compliant', 'Non-Compliant', 'In-Progress'];

const recentComplianceEvents = [
    { id: 'CE-001', type: 'Baseline Drift', deployment: 'DEP-US-EAST-01', status: 'Non-Compliant', timestamp: '2025-11-26 10:15:00' },
    { id: 'CE-002', type: 'Validation Scan', deployment: 'DEP-EU-WEST-03', status: 'In-Progress', timestamp: '2025-11-26 10:10:00' },
    { id: 'CE-003', type: 'Patch Applied', deployment: 'DEP-APAC-SE-02', status: 'Compliant', timestamp: '2025-11-26 10:05:00' },
    { id: 'CE-004', type: 'Configuration Check', deployment: 'DEP-US-WEST-01', status: 'Compliant', timestamp: '2025-11-26 10:00:00' },
];

export default function Page() {
    const [user, setUser] = useState<User | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        
        async function fetchData() {
            setLoading(true);
            try {
                const [deploymentsRes, baselinesRes] = await Promise.all([
                    fetch('/api/deployments'),
                    fetch('/api/baselines'),
                ]);

                if (deploymentsRes.ok) {
                    const deploymentsData = await deploymentsRes.json();
                    setDeployments(deploymentsData);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch deployments.' });
                }

                if (baselinesRes.ok) {
                    const baselinesData = await baselinesRes.json();
                    setBaselines(baselinesData);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch baselines.' });
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching data.' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const complianceDeployments: ComplianceDeployment[] = useMemo(() => {
        return deployments.map(d => ({
            ...d,
            compliance: {
                status: complianceStatuses[Math.floor(Math.random() * complianceStatuses.length)],
                lastChecked: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
                issues: Math.floor(Math.random() * 3),
            }
        }));
    }, [deployments]);
    
    const summaryStats = useMemo(() => {
        const compliantCount = complianceDeployments.filter(d => d.compliance.status === 'Compliant').length;
        const nonCompliantCount = complianceDeployments.filter(d => d.compliance.status === 'Non-Compliant').length;
        const total = complianceDeployments.length;
        return {
            compliant: compliantCount,
            nonCompliant: nonCompliantCount,
            inProgress: baselines.filter(b => b.status === 'VALIDATING').length,
            complianceRate: total > 0 ? ((compliantCount / total) * 100).toFixed(1) : 'N/A'
        }
    }, [complianceDeployments, baselines]);


    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-8 p-6 md:p-10">
                <h1 className="text-3xl font-bold tracking-tight">Compliance Monitoring Dashboard</h1>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.complianceRate}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Compliant Deployments</CardTitle>
                            <Check className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.compliant}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Non-Compliant Deployments</CardTitle>
                            <X className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.nonCompliant}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Baselines in Validation</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.inProgress}</div>
                        </CardContent>
                    </Card>
                </div>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Global Compliance View</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="h-[60vh]">
                        {loading ? <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : <ComplianceMap deployments={complianceDeployments} />}
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance by Baseline</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Baseline</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {baselines.slice(0, 5).map((b) => (
                                        <TableRow key={b._id}>
                                            <TableCell className="font-mono text-xs">{b._id}</TableCell>
                                            <TableCell>{b.product.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={b.status === 'VALIDATED' ? 'default' : 'secondary'}>
                                                    {b.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Compliance Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Deployment</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentComplianceEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>{event.timestamp}</TableCell>
                                            <TableCell>{event.type}</TableCell>
                                            <TableCell className="font-mono text-xs">{event.deployment}</TableCell>
                                             <TableCell>
                                                <Badge variant={event.status === 'Non-Compliant' ? 'destructive' : 'default'}>
                                                    {event.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
