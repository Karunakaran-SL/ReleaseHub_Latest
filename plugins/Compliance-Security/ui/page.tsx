import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import clientPromise from '@/lib/mongodb';

const mockControls = [
    { id: 'SC-001', name: 'Access Control Policy', category: 'Identity', status: 'compliant', severity: 'high', lastReviewed: '2026-02-01' },
    { id: 'SC-002', name: 'Multi-Factor Authentication', category: 'Identity', status: 'compliant', severity: 'critical', lastReviewed: '2026-01-15' },
    { id: 'SC-003', name: 'Network Segmentation', category: 'Network', status: 'in-review', severity: 'high', lastReviewed: '2026-01-20' },
    { id: 'SC-004', name: 'Encryption at Rest', category: 'Data', status: 'compliant', severity: 'critical', lastReviewed: '2026-02-10' },
    { id: 'SC-005', name: 'Vulnerability Scanning', category: 'Operations', status: 'non-compliant', severity: 'high', lastReviewed: '2025-12-05' },
    { id: 'SC-006', name: 'Incident Response Plan', category: 'Operations', status: 'compliant', severity: 'medium', lastReviewed: '2026-01-30' },
];

const mockIncidents = [
    { id: 'SI-001', title: 'Unauthorized login attempt detected', severity: 'high', status: 'open', reportedAt: '2026-03-01' },
    { id: 'SI-002', title: 'Phishing email campaign identified', severity: 'medium', status: 'investigating', reportedAt: '2026-02-28' },
    { id: 'SI-003', title: 'Dependency vulnerability CVE-2024-1234', severity: 'critical', status: 'resolved', reportedAt: '2026-02-20' },
    { id: 'SI-004', title: 'Expired SSL certificate on staging', severity: 'low', status: 'resolved', reportedAt: '2026-02-15' },
];

const statusColor: Record<string, string> = {
    compliant: 'bg-green-100 text-green-800',
    'in-review': 'bg-yellow-100 text-yellow-800',
    'non-compliant': 'bg-red-100 text-red-800',
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
};

const severityColor: Record<string, string> = {
    critical: 'bg-red-200 text-red-900',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
};

export default async function SecurityCompliancePage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let dbControlCount = 0, dbIncidentCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        dbControlCount = await db.collection('security_controls').countDocuments();
        dbIncidentCount = await db.collection('security_incidents').countDocuments();
    } catch { /* use mock data */ }

    const compliantCount = mockControls.filter(c => c.status === 'compliant').length;
    const openIncidentCount = mockIncidents.filter(i => i.status === 'open').length;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Security Compliance</h1>
                        <p className="text-muted-foreground mt-1">Monitor security controls, vulnerabilities, and incident status.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Total Controls</CardDescription>
                            <CardTitle className="text-4xl">{mockControls.length + dbControlCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">across all categories</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Compliant</CardDescription>
                            <CardTitle className="text-4xl">{compliantCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-xs text-green-600">
                                <TrendingUp className="h-3 w-3" />
                                {Math.round((compliantCount / mockControls.length) * 100)}% compliance rate
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Open Incidents</CardDescription>
                            <CardTitle className="text-4xl">{openIncidentCount + dbIncidentCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">requiring immediate attention</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Non-Compliant</CardDescription>
                            <CardTitle className="text-4xl">{mockControls.filter(c => c.status === 'non-compliant').length}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">controls need remediation</p></CardContent>
                    </Card>
                </div>

                {/* Controls Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-500" /> Security Controls</CardTitle>
                        <CardDescription>Current status of all registered security controls.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Control Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Reviewed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockControls.map(control => (
                                    <TableRow key={control.id}>
                                        <TableCell className="font-mono text-xs">{control.id}</TableCell>
                                        <TableCell className="font-medium">{control.name}</TableCell>
                                        <TableCell>{control.category}</TableCell>
                                        <TableCell><Badge className={severityColor[control.severity]}>{control.severity}</Badge></TableCell>
                                        <TableCell><Badge className={statusColor[control.status]}>{control.status}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{control.lastReviewed}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Incidents Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> Security Incidents</CardTitle>
                        <CardDescription>Recent security incidents and their current resolution status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reported</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockIncidents.map(incident => (
                                    <TableRow key={incident.id}>
                                        <TableCell className="font-mono text-xs">{incident.id}</TableCell>
                                        <TableCell className="font-medium">{incident.title}</TableCell>
                                        <TableCell><Badge className={severityColor[incident.severity]}>{incident.severity}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {incident.status === 'resolved' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                                                    incident.status === 'open' ? <XCircle className="h-3 w-3 text-red-500" /> :
                                                        <Clock className="h-3 w-3 text-yellow-500" />}
                                                <Badge className={statusColor[incident.status]}>{incident.status}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{incident.reportedAt}</TableCell>
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
