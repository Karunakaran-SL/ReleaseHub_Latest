
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, UpgradeHistory, Product, Specification } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlayCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    UPGRADE_APPROVAL: 'bg-orange-200 text-orange-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
    SCHEDULED: 'bg-blue-200 text-blue-800',
    COMPLETED: 'bg-green-200 text-green-800',
    APPROVAL_IN_PROGRESS: 'bg-orange-200 text-orange-800',
};

interface GroupedUpgrade extends Omit<UpgradeHistory, 'deploymentId'> {
    deploymentIds: string[];
}

export default function UpgradeStatusPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [upgrades, setUpgrades] = useState<GroupedUpgrade[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            setLoading(true);
            try {
                const [upgradesRes, productsRes, specsRes] = await Promise.all([
                    fetch('/api/upgrade-history'),
                    fetch('/api/products'),
                    fetch('/api/specifications')
                ]);

                if (!upgradesRes.ok) throw new Error('Failed to fetch upgrade history.');
                if (!productsRes.ok) throw new Error('Failed to fetch products.');
                if (!specsRes.ok) throw new Error('Failed to fetch specifications.');

                setUpgrades(await upgradesRes.json());
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const getProductName = (productId: string) => products.find(p => p._id === productId)?.name || 'Unknown';
    const getSpecName = (specId: string) => specifications.find(s => s._id === specId)?.name || 'Unknown';

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Upgrade Operations Status</CardTitle>
                        <CardDescription>Track the status of all initiated multi-deployment upgrades.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Initiated At</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Target Spec</TableHead>
                                    <TableHead># Deployments</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Initiated By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                     <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                                ) : upgrades.length > 0 ? (
                                    upgrades.map(upgrade => (
                                        <TableRow key={upgrade.initiatedAt + upgrade.productId}>
                                            <TableCell>{format(new Date(upgrade.initiatedAt), 'PPp')}</TableCell>
                                            <TableCell>{getProductName(upgrade.productId)}</TableCell>
                                            <TableCell>{getSpecName(upgrade.targetSpecificationId)}</TableCell>
                                            <TableCell>
                                                 <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="link" className="p-0 h-auto">{upgrade.deploymentIds.length}</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Deployments in this Upgrade</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            <ul className="list-disc pl-5">
                                                                {upgrade.deploymentIds.map(id => <li key={id} className="font-mono text-sm">{id}</li>)}
                                                            </ul>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(statusColors[upgrade.status] || 'bg-gray-200')}>
                                                    {upgrade.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{upgrade.initiatedBy}</TableCell>
                                            <TableCell className="text-right">
                                                {upgrade.status === 'APPROVAL_IN_PROGRESS' && (
                                                    <Button asChild size="sm">
                                                        <Link href={`/fleet-management/deployment/upgrade?resume=${upgrade.deploymentIds[0]}`}>
                                                            <PlayCircle className="mr-2 h-4 w-4" />
                                                            Resume Approval
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={7} className="text-center">No upgrade operations found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    )
}
