import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, ClipboardList, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import clientPromise from '@/lib/mongodb';

const mockSops = [
    { id: 'SOP-001', title: 'Deployment Change Procedure', owner: 'Platform Team', status: 'approved', version: '3.1', lastReviewed: '2026-01-15' },
    { id: 'SOP-002', title: 'Incident Response Playbook', owner: 'Security Team', status: 'approved', version: '2.4', lastReviewed: '2026-02-01' },
    { id: 'SOP-003', title: 'Onboarding Checklist', owner: 'HR Operations', status: 'in-review', version: '1.8', lastReviewed: '2025-11-10' },
    { id: 'SOP-004', title: 'Data Backup & Recovery', owner: 'Platform Team', status: 'approved', version: '4.0', lastReviewed: '2026-01-28' },
    { id: 'SOP-005', title: 'Vendor Onboarding Protocol', owner: 'Procurement', status: 'draft', version: '1.0', lastReviewed: '2026-02-20' },
];

const mockDeviations = [
    { id: 'DEV-001', title: 'Emergency hotfix bypassed change window', sop: 'SOP-001', severity: 'high', status: 'open', reportedAt: '2026-03-02' },
    { id: 'DEV-002', title: 'Missing dual approvals on release', sop: 'SOP-001', severity: 'medium', status: 'resolved', reportedAt: '2026-02-18' },
    { id: 'DEV-003', title: 'Backup validation test not performed', sop: 'SOP-004', severity: 'high', status: 'investigating', reportedAt: '2026-02-25' },
];

const statusColor: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    'in-review': 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
};
const severityColor: Record<string, string> = {
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
};

export default async function OperationalCompliancePage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let dbSopCount = 0, dbDeviationCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        dbSopCount = await db.collection('sops').countDocuments();
        dbDeviationCount = await db.collection('operational_deviations').countDocuments();
    } catch { /* use mock data */ }

    const approvedSops = mockSops.filter(s => s.status === 'approved').length;
    const openDeviations = mockDeviations.filter(d => d.status === 'open').length;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Operational Compliance</h1>
                        <p className="text-muted-foreground mt-1">Manage SOPs, process checklists, and deviation reports.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-teal-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Total SOPs</CardDescription>
                            <CardTitle className="text-4xl">{mockSops.length + dbSopCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">standard operating procedures</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Approved SOPs</CardDescription>
                            <CardTitle className="text-4xl">{approvedSops}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-xs text-green-600">
                                <TrendingUp className="h-3 w-3" /> {Math.round((approvedSops / mockSops.length) * 100)}% approval rate
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Open Deviations</CardDescription>
                            <CardTitle className="text-4xl">{openDeviations + dbDeviationCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-red-600">require immediate action</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Clock className="h-4 w-4" /> In Review</CardDescription>
                            <CardTitle className="text-4xl">{mockSops.filter(s => s.status === 'in-review').length}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">SOPs pending approval</p></CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-teal-500" /> Standard Operating Procedures</CardTitle>
                        <CardDescription>All registered SOPs with their current review status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Owner</TableHead>
                                    <TableHead>Version</TableHead><TableHead>Status</TableHead><TableHead>Last Reviewed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockSops.map(sop => (
                                    <TableRow key={sop.id}>
                                        <TableCell className="font-mono text-xs">{sop.id}</TableCell>
                                        <TableCell className="font-medium">{sop.title}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{sop.owner}</TableCell>
                                        <TableCell>{sop.version}</TableCell>
                                        <TableCell><Badge className={statusColor[sop.status]}>{sop.status}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{sop.lastReviewed}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /> Process Deviations</CardTitle>
                        <CardDescription>Reported deviations from standard operating procedures.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Description</TableHead><TableHead>Related SOP</TableHead>
                                    <TableHead>Severity</TableHead><TableHead>Status</TableHead><TableHead>Reported</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockDeviations.map(dev => (
                                    <TableRow key={dev.id}>
                                        <TableCell className="font-mono text-xs">{dev.id}</TableCell>
                                        <TableCell className="font-medium">{dev.title}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{dev.sop}</TableCell>
                                        <TableCell><Badge className={severityColor[dev.severity]}>{dev.severity}</Badge></TableCell>
                                        <TableCell><Badge className={statusColor[dev.status]}>{dev.status}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{dev.reportedAt}</TableCell>
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
