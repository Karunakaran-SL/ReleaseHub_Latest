'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User, Deployment } from '@/lib/definitions';
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
import { Shield, AlertTriangle, Bell, CheckSquare, Globe, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { SecurityDeployment } from './_components/security-map';

const SecurityMap = dynamic(() => import('./_components/security-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});


const summaryData = [
  { title: 'High-Risk Deployments', value: '12', icon: <Shield className="h-4 w-4 text-red-500" /> },
  { title: 'Vulnerabilities (24h)', value: '45', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> },
  { title: 'Security Alerts (24h)', value: '128', icon: <Bell className="h-4 w-4 text-orange-500" /> },
  { title: 'Compliance', value: '98.2%', icon: <CheckSquare className="h-4 w-4 text-green-500" /> },
];

const recentEventsData = [
  { id: 'EVT-001', type: 'Unusual Login', severity: 'High', deployment: 'DEP-US-EAST-01', location: 'USA', timestamp: '2025-11-26 14:30:00' },
  { id: 'EVT-002', type: 'CVE-2025-1234 Found', severity: 'Critical', deployment: 'DEP-EU-WEST-03', location: 'Germany', timestamp: '2025-11-26 14:25:00' },
  { id: 'EVT-003', type: 'Port Scan Detected', severity: 'Medium', deployment: 'DEP-APAC-SE-02', location: 'Singapore', timestamp: '2025-11-26 14:10:00' },
  { id: 'EVT-004', type: 'Data Exfiltration Attempt', severity: 'High', deployment: 'DEP-US-WEST-01', location: 'USA', timestamp: '2025-11-26 14:05:00' },
  { id: 'EVT-005', type: 'Misconfiguration', severity: 'Low', deployment: 'DEP-EU-CENTRAL-01', location: 'France', timestamp: '2025-11-26 13:50:00' },
];

const vulnerabilityTypes = [
    { name: 'CVE', value: 18, color: '#FF6384' },
    { name: 'Misconfiguration', value: 12, color: '#36A2EB' },
    { name: 'Network Exposure', value: 8, color: '#FFCE56' },
    { name: 'Credential Leak', value: 7, color: '#4BC0C0' },
];

const securityStatuses: SecurityDeployment['security']['status'][] = ['Normal', 'Elevated', 'High', 'Critical'];

export default function Page() {
    const [user, setUser] = useState<User | null>(null);
    const [securityDeployments, setSecurityDeployments] = useState<SecurityDeployment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser().then(setUser);
        fetch('/api/deployments')
            .then(res => res.json())
            .then((deployments: Deployment[]) => {
                const augmentedData = deployments.map(d => ({
                    ...d,
                    security: {
                        status: securityStatuses[Math.floor(Math.random() * securityStatuses.length)],
                        openAlerts: Math.floor(Math.random() * 5),
                        vulnerabilities: Math.floor(Math.random() * 10),
                    }
                }));
                setSecurityDeployments(augmentedData);
                setLoading(false);
            });
    }, []);

    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-8 p-6 md:p-10">
                <h1 className="text-3xl font-bold tracking-tight">Security Monitoring Dashboard</h1>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {summaryData.map((item, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                {item.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-5">
                    <Card className="md:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Global Security View</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="h-[60vh]">
                            <SecurityMap deployments={securityDeployments} />
                        </CardContent>
                    </Card>
                     <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Vulnerability Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="h-full w-full">
                                <PieChart>
                                    <Pie data={vulnerabilityTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                        {vulnerabilityTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
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
                        <CardTitle>Recent Security Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Event Type</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Deployment ID</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentEventsData.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>{event.timestamp}</TableCell>
                                        <TableCell>{event.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={event.severity === 'High' ? 'destructive' : event.severity === 'Critical' ? 'destructive' : 'secondary'}>
                                                {event.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{event.deployment}</TableCell>
                                        <TableCell>{event.location}</TableCell>
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