import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Landmark, BookOpen, FileCheck, Award, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import clientPromise from '@/lib/mongodb';

const mockFrameworks = [
    { id: 'RF-001', name: 'ISO 27001', domain: 'Information Security', certified: true, certExpiry: '2027-06-30', evidenceItems: 42, owner: 'CISO Office' },
    { id: 'RF-002', name: 'SOC 2 Type II', domain: 'Trust Services', certified: true, certExpiry: '2027-02-28', evidenceItems: 67, owner: 'Compliance Team' },
    { id: 'RF-003', name: 'HIPAA', domain: 'Healthcare', certified: false, certExpiry: null, evidenceItems: 18, owner: 'Legal & Compliance' },
    { id: 'RF-004', name: 'GDPR', domain: 'Data Privacy', certified: true, certExpiry: '2027-12-31', evidenceItems: 34, owner: 'DPO Office' },
];

const mockEvidence = [
    { id: 'EV-001', title: 'Annual Penetration Test Report', framework: 'ISO 27001', status: 'approved', submittedAt: '2026-01-10', expiry: '2027-01-10' },
    { id: 'EV-002', title: 'Access Control Review Log Q4', framework: 'SOC 2 Type II', status: 'pending', submittedAt: '2026-02-28', expiry: '2027-02-28' },
    { id: 'EV-003', title: 'Data Encryption Policy v2.1', framework: 'GDPR', status: 'approved', submittedAt: '2025-12-15', expiry: '2026-12-15' },
    { id: 'EV-004', title: 'HIPAA Risk Assessment', framework: 'HIPAA', status: 'pending', submittedAt: '2026-03-01', expiry: '2027-03-01' },
];

const evidenceStatusColor: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
};

export default async function RegulatoryCompliancePage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let dbCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        dbCount = await db.collection('regulatory_frameworks').countDocuments();
    } catch { /* use mock data */ }

    const certifiedCount = mockFrameworks.filter(f => f.certified).length;
    const pendingEvidence = mockEvidence.filter(e => e.status === 'pending').length;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                        <Landmark className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Regulatory Compliance</h1>
                        <p className="text-muted-foreground mt-1">Track regulatory frameworks, certifications and evidence submissions.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-indigo-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Frameworks</CardDescription>
                            <CardTitle className="text-4xl">{mockFrameworks.length + dbCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">tracked regulatory frameworks</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Award className="h-4 w-4" /> Certified</CardDescription>
                            <CardTitle className="text-4xl">{certifiedCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-green-600">{Math.round((certifiedCount / mockFrameworks.length) * 100)}% certified</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><FileCheck className="h-4 w-4" /> Evidence Items</CardDescription>
                            <CardTitle className="text-4xl">{mockEvidence.length}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">records on file</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Clock className="h-4 w-4" /> Pending Review</CardDescription>
                            <CardTitle className="text-4xl">{pendingEvidence}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-yellow-600">awaiting approval</p></CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-500" /> Regulatory Frameworks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Framework</TableHead><TableHead>Domain</TableHead>
                                    <TableHead>Owner</TableHead><TableHead>Certified</TableHead><TableHead>Cert. Expiry</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockFrameworks.map(fw => (
                                    <TableRow key={fw.id}>
                                        <TableCell className="font-mono text-xs">{fw.id}</TableCell>
                                        <TableCell className="font-medium">{fw.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{fw.domain}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{fw.owner}</TableCell>
                                        <TableCell>
                                            {fw.certified ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{fw.certExpiry || '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-blue-500" /> Evidence Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Framework</TableHead>
                                    <TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Valid Until</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockEvidence.map(ev => (
                                    <TableRow key={ev.id}>
                                        <TableCell className="font-mono text-xs">{ev.id}</TableCell>
                                        <TableCell className="font-medium">{ev.title}</TableCell>
                                        <TableCell><Badge variant="outline">{ev.framework}</Badge></TableCell>
                                        <TableCell><Badge className={evidenceStatusColor[ev.status]}>{ev.status}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{ev.submittedAt}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{ev.expiry}</TableCell>
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
