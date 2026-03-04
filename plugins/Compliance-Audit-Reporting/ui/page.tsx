import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileArchive, ClipboardCheck, Search, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import clientPromise from '@/lib/mongodb';

const mockAudits = [
    { id: 'AUD-001', title: 'Annual Security Audit', type: 'Internal', status: 'completed', auditor: 'Internal Audit Team', startDate: '2026-01-10', endDate: '2026-01-24' },
    { id: 'AUD-002', title: 'SOC 2 Type II Audit', type: 'External', status: 'scheduled', auditor: 'Ernst & Young', startDate: '2026-04-01', endDate: '2026-05-15' },
    { id: 'AUD-003', title: 'GDPR Compliance Review', type: 'Internal', status: 'in-progress', auditor: 'Legal & Compliance', startDate: '2026-02-15', endDate: '2026-03-15' },
    { id: 'AUD-004', title: 'Penetration Test Q1', type: 'External', status: 'completed', auditor: 'HackSafe Inc', startDate: '2026-01-20', endDate: '2026-01-25' },
];

const mockFindings = [
    { id: 'AF-001', title: 'Missing MFA on 3 admin accounts', severity: 'critical', status: 'open', audit: 'AUD-001', dueDate: '2026-03-15' },
    { id: 'AF-002', title: 'Log rotation policy not enforced', severity: 'medium', status: 'resolved', audit: 'AUD-001', dueDate: '2026-02-28' },
    { id: 'AF-003', title: 'Third-party vendor access not scoped', severity: 'high', status: 'open', audit: 'AUD-003', dueDate: '2026-04-01' },
    { id: 'AF-004', title: 'TLS 1.0 still enabled on legacy endpoint', severity: 'high', status: 'in-remediation', audit: 'AUD-004', dueDate: '2026-03-20' },
    { id: 'AF-005', title: 'Annual backup restore test not documented', severity: 'medium', status: 'open', audit: 'AUD-001', dueDate: '2026-03-31' },
];

const auditStatusColor: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
};
const findingStatusColor: Record<string, string> = {
    open: 'bg-red-100 text-red-800',
    'in-remediation': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
};
const severityColor: Record<string, string> = {
    critical: 'bg-red-200 text-red-900',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
};

export default async function AuditReportingPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let dbAuditCount = 0, dbFindingCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        dbAuditCount = await db.collection('compliance_audits').countDocuments();
        dbFindingCount = await db.collection('audit_findings').countDocuments();
    } catch { /* use mock data */ }

    const openFindings = mockFindings.filter(f => f.status === 'open').length;
    const scheduledAudits = mockAudits.filter(a => a.status === 'scheduled').length;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-900/40 flex items-center justify-center">
                        <FileArchive className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Audit &amp; Reporting</h1>
                        <p className="text-muted-foreground mt-1">Track audit schedules, findings, and compliance reports.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-slate-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Total Audits</CardDescription>
                            <CardTitle className="text-4xl">{mockAudits.length + dbAuditCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">recorded audit events</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Scheduled</CardDescription>
                            <CardTitle className="text-4xl">{scheduledAudits}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-blue-600">upcoming audits</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Open Findings</CardDescription>
                            <CardTitle className="text-4xl">{openFindings + dbFindingCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-red-600">require remediation</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Resolved</CardDescription>
                            <CardTitle className="text-4xl">{mockFindings.filter(f => f.status === 'resolved').length}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-green-600">findings closed</p></CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-slate-500" /> Audit Schedule</CardTitle>
                        <CardDescription>Recent and upcoming compliance audit events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Audit Title</TableHead><TableHead>Type</TableHead>
                                    <TableHead>Auditor</TableHead><TableHead>Status</TableHead><TableHead>Period</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockAudits.map(audit => (
                                    <TableRow key={audit.id}>
                                        <TableCell className="font-mono text-xs">{audit.id}</TableCell>
                                        <TableCell className="font-medium">{audit.title}</TableCell>
                                        <TableCell><Badge variant="outline">{audit.type}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{audit.auditor}</TableCell>
                                        <TableCell><Badge className={auditStatusColor[audit.status]}>{audit.status}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{audit.startDate} → {audit.endDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-red-500" /> Audit Findings</CardTitle>
                        <CardDescription>Open and resolved findings from all audits.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Finding</TableHead><TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead><TableHead>Audit Ref</TableHead><TableHead>Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockFindings.map(f => (
                                    <TableRow key={f.id}>
                                        <TableCell className="font-mono text-xs">{f.id}</TableCell>
                                        <TableCell className="font-medium">{f.title}</TableCell>
                                        <TableCell><Badge className={severityColor[f.severity]}>{f.severity}</Badge></TableCell>
                                        <TableCell><Badge className={findingStatusColor[f.status]}>{f.status}</Badge></TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{f.audit}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{f.dueDate}</TableCell>
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
