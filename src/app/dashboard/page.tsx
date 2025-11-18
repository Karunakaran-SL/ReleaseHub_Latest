
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, List, CheckCircle, Package } from 'lucide-react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment } from '@/lib/definitions';
import { Loader2, Move, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';

const DeploymentMap = dynamic(() => import('@/app/fleet-management/deployment/_components/deployment-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

function Widget({ title, children, description }: { title: string, children: React.ReactNode, description?: string }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className='flex-row items-center justify-between'>
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="cursor-move h-8 w-8">
                        <Move className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {children}
            </CardContent>
        </Card>
    )
}

function GlobalViewWidget() {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetch('/api/deployments')
            .then(res => res.json())
            .then(setDeployments);
    }, []);

    return (
        <Widget title="Global View" description="Worldwide operational status of all deployments.">
            <div className="h-[60vh]">
                {isClient ? <DeploymentMap deployments={deployments} /> : <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            </div>
        </Widget>
    );
}

function TableWidget({ title, headers, data }: { title: string, headers: string[], data: string[][] }) {
    return (
        <Widget title={title}>
             <Table>
                <TableHeader>
                    <TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, i) => (
                        <TableRow key={i}>{row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}</TableRow>
                    ))}
                </TableBody>
            </Table>
        </Widget>
    )
}

export default function DashboardV2Page() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

  return (
    <DashboardLayout user={user}>
        <main className="flex-1 space-y-8 p-6 md:p-10">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Your central hub for monitoring and managing all operations.</p>
        </div>
        <div className="space-y-6">
            <GlobalViewWidget />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                 <TableWidget 
                    title="Products" 
                    headers={["Name", "Version", "Owner"]}
                    data={[
                        ["OneStopShop Portal", "1.0.0", "Platform Engineering"],
                        ["Unified Data Fabric", "1.0.0", "Data Platform Team"],
                    ]}
                 />
                 <TableWidget 
                    title="Tenants" 
                    headers={["Name", "Version", "Products"]}
                    data={[
                        ["Core Platform Services", "2.0.0", "2"],
                        ["Customer Analytics", "1.5.0", "1"],
                    ]}
                 />
                 <TableWidget 
                    title="Releases" 
                    headers={["ID", "Product", "Version", "Status"]}
                    data={[
                        ["REL-2024-001", "OneStopShop", "1.1.0", "PLANNED"],
                        ["REL-2024-002", "Data Fabric", "1.0.1", "IN-PROGRESS"],
                    ]}
                 />
                 <TableWidget 
                    title="Baselines" 
                    headers={["ID", "Product", "Version", "Status"]}
                    data={[
                        ["OneStopShopPortal_1.0.0", "OneStopShop Portal", "1.0.0", "RELEASED"],
                        ["UnifiedDataFabric_1.0.0", "Unified Data Fabric", "1.0.0", "DRAFT"],
                    ]}
                 />
            </div>
        </div>
        </main>
    </DashboardLayout>
  );
}
