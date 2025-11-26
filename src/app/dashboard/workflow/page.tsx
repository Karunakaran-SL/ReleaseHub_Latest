'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '../../dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Workflow, CheckCircle, XCircle, Clock } from 'lucide-react';

const summaryData = [
  { title: 'Total Workflows', value: '78', icon: <Workflow className="h-4 w-4 text-muted-foreground" /> },
  { title: 'Active Workflows', value: '65', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  { title: 'Avg. Execution Time', value: '45s', icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
  { title: 'Failed Executions (24h)', value: '12', icon: <XCircle className="h-4 w-4 text-red-500" /> },
];

export default function Page() {
    const [user, setUser] = useState<User | null>(null);
    const [n8nUrl, setN8nUrl] = useState('http://localhost:5678');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser().then(setUser);
        // In a real app, you would fetch the configured n8n URL from your settings API
        setLoading(false);
    }, []);

    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-8 p-6 md:p-10">
                <h1 className="text-3xl font-bold tracking-tight">Workflow Dashboard</h1>
                
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
                        <CardTitle>n8n Workflow Management</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100vh-28rem)]">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <iframe
                                src={n8nUrl}
                                className="h-full w-full border-0"
                                title="Workflow Management Dashboard"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}