'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '../dashboard-layout';
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
import { Briefcase, Play, Check, X, Clock } from 'lucide-react';

const summaryData = [
  { title: 'Total Jobs', value: '542', icon: <Briefcase className="h-4 w-4 text-muted-foreground" /> },
  { title: 'Running', value: '12', icon: <Play className="h-4 w-4 text-blue-500" /> },
  { title: 'Completed (24h)', value: '189', icon: <Check className="h-4 w-4 text-green-500" /> },
  { title: 'Failed (24h)', value: '3', icon: <X className="h-4 w-4 text-red-500" /> },
];

const recentJobsData = [
  { id: 'JOB-001', name: 'Data Ingestion Pipeline', status: 'Completed', startTime: '2025-11-26 12:00:00', duration: '5.2 min' },
  { id: 'JOB-002', name: 'Report Generation', status: 'Running', startTime: '2025-11-26 12:05:00', duration: '...' },
  { id: 'JOB-003', name: 'Database Backup', status: 'Completed', startTime: '2025-11-26 11:55:00', duration: '2.1 min' },
  { id: 'JOB-004', name: 'User Sync', status: 'Failed', startTime: '2025-11-26 11:50:00', duration: '0.5 min' },
  { id: 'JOB-005', name: 'Cache Warming', status: 'Completed', startTime: '2025-11-26 11:45:00', duration: '1.5 min' },
];

export default function Page() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-8 p-6 md:p-10">
                <h1 className="text-3xl font-bold tracking-tight">Jobs Monitoring</h1>
                
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

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentJobsData.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-mono text-xs">{job.id}</TableCell>
                                        <TableCell>{job.name}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={
                                                    job.status === 'Completed' ? 'default' :
                                                    job.status === 'Running' ? 'outline' :
                                                    'destructive'
                                                }
                                            >
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{job.startTime}</TableCell>
                                        <TableCell>{job.duration}</TableCell>
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
