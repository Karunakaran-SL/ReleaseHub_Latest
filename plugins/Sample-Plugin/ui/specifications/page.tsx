import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from 'lucide-react';
import clientPromise from '@/lib/mongodb';

export default async function PluginSpecificationsPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user.id, username: user.username } : null;

    let specifications: any[] = [];
    try {
        const client = await clientPromise;
        const db = client.db();
        specifications = await db.collection('specifications').find({}).toArray();
    } catch (error) {
        console.error('Failed to fetch specifications:', error);
    }

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6 text-emerald-500" /> Specifications
                    </h2>
                    <p className="text-muted-foreground mt-1">All registered hardware and cluster specifications.</p>
                </div>

                <Card className="shadow-sm border-border/50">
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>HW Type</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Cluster Name</TableHead>
                                    <TableHead>Contact Email</TableHead>
                                    <TableHead>CPU Arch</TableHead>
                                    <TableHead>Hypervisor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {specifications.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No specifications found.</TableCell></TableRow>
                                ) : specifications.map((s: any) => (
                                    <TableRow key={s._id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>
                                            {s.hw_type?.name ? <Badge variant="outline">{s.hw_type.name}</Badge> : '-'}
                                        </TableCell>
                                        <TableCell>{s.vendor || '-'}</TableCell>
                                        <TableCell>{s.clusterName || '-'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{s.contact_point_email || '-'}</TableCell>
                                        <TableCell>{s.cpuArchitecture || '-'}</TableCell>
                                        <TableCell>{s.hypervisor?.name || '-'}</TableCell>
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
