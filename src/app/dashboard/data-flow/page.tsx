'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/definitions';
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
import { ArrowUp, ArrowDown, Clock, CheckCircle, XCircle } from 'lucide-react';

// Dummy data for the dashboard
const summaryData = [
  { title: 'Total Flows', value: '1,250', icon: <ArrowUp className="h-4 w-4 text-green-500" />, change: '+15.2%', changeType: 'increase' },
  { title: 'Successful Runs', value: '1,180', icon: <CheckCircle className="h-4 w-4 text-green-500" />, change: '94.4%', changeType: 'increase' },
  { title: 'Failed Runs', value: '70', icon: <XCircle className="h-4 w-4 text-red-500" />, change: '5.6%', changeType: 'decrease' },
  { title: 'Avg. Duration', value: '2.5 min', icon: <Clock className="h-4 w-4 text-gray-500" />, change: '-2.1%', changeType: 'decrease' },
];

const recentRunsData = [
  { id: 'RUN-1234', flowName: 'Customer Data Sync', status: 'Success', startTime: '2025-11-26 10:00:00', duration: '1.8 min' },
  { id: 'RUN-1233', flowName: 'Product Inventory Update', status: 'Success', startTime: '2025-11-26 09:45:00', duration: '2.2 min' },
  { id: 'RUN-1232', flowName: 'Sales-to-Analytics Pipeline', status: 'Failed', startTime: '2025-11-26 09:30:00', duration: '0.5 min' },
  { id: 'RUN-1231', flowName: 'User Engagement Tracking', status: 'Success', startTime: '2025-11-26 09:15:00', duration: '3.1 min' },
  { id: 'RUN-1230', flowName: 'Customer Data Sync', status: 'Success', startTime: '2025-11-26 09:00:00', duration: '1.9 min' },
];

export default function Page() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-8 p-6 md:p-10">
                <h1 className="text-3xl font-bold tracking-tight">Data Flow Dashboard</h1>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {summaryData.map((item, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                {item.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.value}</div>
                                <p className={`text-xs ${item.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>{item.change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Data Flow Runs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Run ID</TableHead>
                                    <TableHead>Flow Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentRunsData.map((run) => (
                                    <TableRow key={run.id}>
                                        <TableCell className="font-mono text-xs">{run.id}</TableCell>
                                        <TableCell>{run.flowName}</TableCell>
                                        <TableCell>
                                            <Badge variant={run.status === 'Success' ? 'default' : 'destructive'}>
                                                {run.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{run.startTime}</TableCell>
                                        <TableCell>{run.duration}</TableCell>
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
