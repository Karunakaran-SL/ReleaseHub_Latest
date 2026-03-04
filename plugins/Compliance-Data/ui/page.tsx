import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Database, FileSearch, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import clientPromise from '@/lib/mongodb';

const mockDataAssets = [
    { id: 'DA-001', name: 'Customer PII Database', classification: 'Confidential', region: 'EU', retention: '5 years', encrypted: true },
    { id: 'DA-002', name: 'Product Telemetry Metrics', classification: 'Internal', region: 'Global', retention: '2 years', encrypted: true },
    { id: 'DA-003', name: 'Employee Records', classification: 'Restricted', region: 'US', retention: '7 years', encrypted: true },
    { id: 'DA-004', name: 'Public API Logs', classification: 'Public', region: 'Global', retention: '90 days', encrypted: false },
    { id: 'DA-005', name: 'Audit Trail Archive', classification: 'Confidential', region: 'EU', retention: '10 years', encrypted: true },
];

const mockDsarRequests = [
    { id: 'DR-001', subject: 'J. Smith', type: 'Access', status: 'pending', received: '2026-02-25', deadline: '2026-03-25' },
    { id: 'DR-002', subject: 'A. Johnson', type: 'Erasure', status: 'completed', received: '2026-02-10', deadline: '2026-03-10' },
    { id: 'DR-003', subject: 'M. Williams', type: 'Portability', status: 'in-progress', received: '2026-03-01', deadline: '2026-03-31' },
    { id: 'DR-004', subject: 'S. Brown', type: 'Rectification', status: 'completed', received: '2026-01-20', deadline: '2026-02-19' },
];

const classificationColor: Record<string, string> = {
    Restricted: 'bg-red-100 text-red-800',
    Confidential: 'bg-orange-100 text-orange-800',
    Internal: 'bg-blue-100 text-blue-800',
    Public: 'bg-green-100 text-green-800',
};

const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

export default async function DataCompliancePage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let dbAssetCount = 0, dbDsarCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        dbAssetCount = await db.collection('data_assets').countDocuments();
        dbDsarCount = await db.collection('dsar_requests').countDocuments();
    } catch { /* use mock data */ }

    const pendingDsar = mockDsarRequests.filter(r => r.status === 'pending').length;
    const encryptedAssets = mockDataAssets.filter(a => a.encrypted).length;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                        <Fingerprint className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Data Compliance</h1>
                        <p className="text-muted-foreground mt-1">Track data assets, GDPR/DSAR requests, and data protection policies.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-violet-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Database className="h-4 w-4" /> Data Assets</CardDescription>
                            <CardTitle className="text-4xl">{mockDataAssets.length + dbAssetCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">registered data assets</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Encrypted</CardDescription>
                            <CardTitle className="text-4xl">{encryptedAssets}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-green-600">{Math.round((encryptedAssets / mockDataAssets.length) * 100)}% encryption coverage</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><FileSearch className="h-4 w-4" /> DSAR Requests</CardDescription>
                            <CardTitle className="text-4xl">{mockDsarRequests.length + dbDsarCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">total requests received</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Clock className="h-4 w-4" /> Pending DSAR</CardDescription>
                            <CardTitle className="text-4xl">{pendingDsar}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-yellow-600">awaiting response</p></CardContent>
                    </Card>
                </div>

                {/* Data Assets Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-violet-500" /> Data Asset Register</CardTitle>
                        <CardDescription>Inventory of all data assets with classification and retention policies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Asset Name</TableHead>
                                    <TableHead>Classification</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Retention</TableHead>
                                    <TableHead>Encrypted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockDataAssets.map(asset => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell><Badge className={classificationColor[asset.classification]}>{asset.classification}</Badge></TableCell>
                                        <TableCell>{asset.region}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{asset.retention}</TableCell>
                                        <TableCell>
                                            {asset.encrypted
                                                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                : <ShieldAlert className="h-4 w-4 text-red-500" />}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* DSAR Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileSearch className="h-5 w-5 text-blue-500" /> DSAR Request Tracker</CardTitle>
                        <CardDescription>Data Subject Access Requests (GDPR Article 15-20).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Data Subject</TableHead>
                                    <TableHead>Request Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Received</TableHead>
                                    <TableHead>Deadline</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockDsarRequests.map(request => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-mono text-xs">{request.id}</TableCell>
                                        <TableCell className="font-medium">{request.subject}</TableCell>
                                        <TableCell>{request.type}</TableCell>
                                        <TableCell><Badge className={statusColor[request.status]}>{request.status}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{request.received}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{request.deadline}</TableCell>
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
