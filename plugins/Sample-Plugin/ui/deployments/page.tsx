import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Rocket } from 'lucide-react';
import clientPromise from '@/lib/mongodb';

const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    UPGRADE_APPROVAL: 'bg-orange-200 text-orange-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
};

export default async function PluginDeploymentsPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user.id, username: user.username } : null;

    let deployments: any[] = [];
    try {
        const client = await clientPromise;
        const db = client.db();
        deployments = await db.collection('deployments').find({}).sort({ createdAt: -1 }).toArray();
    } catch (error) {
        console.error('Failed to fetch deployments:', error);
    }

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Rocket className="h-6 w-6 text-blue-500" /> Deployments
                    </h2>
                    <p className="text-muted-foreground mt-1">All deployments sorted by most recent.</p>
                </div>

                <Card className="shadow-sm border-border/50">
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deployment ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Specification</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deployments.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No deployments found.</TableCell></TableRow>
                                ) : deployments.map((d: any) => (
                                    <TableRow key={d._id}>
                                        <TableCell className="font-mono text-xs">{d.details?.deploymentId || d._id}</TableCell>
                                        <TableCell>{d.details?.customer || '-'}</TableCell>
                                        <TableCell>{d.productId}</TableCell>
                                        <TableCell>{d.specificationId || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[d.status] || 'bg-gray-200'}>{d.status}</Badge>
                                        </TableCell>
                                        <TableCell>{d.createdBy || '-'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</TableCell>
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
