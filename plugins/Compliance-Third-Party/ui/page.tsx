import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookLock, Building2, ClipboardCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import clientPromise from '@/lib/mongodb';

const mockVendors = [
    { id: 'V-001', name: 'Acme Cloud Services', category: 'Cloud Infrastructure', riskLevel: 'high', status: 'approved', contractExpiry: '2026-12-31' },
    { id: 'V-002', name: 'DataSync Solutions', category: 'Data Processing', riskLevel: 'critical', status: 'under-review', contractExpiry: '2026-06-30' },
    { id: 'V-003', name: 'SecureAuth Ltd', category: 'Identity & Access', riskLevel: 'medium', status: 'approved', contractExpiry: '2027-03-15' },
    { id: 'V-004', name: 'LogPipeline Inc', category: 'Monitoring', riskLevel: 'low', status: 'approved', contractExpiry: '2026-09-01' },
    { id: 'V-005', name: 'DevOps Partners', category: 'Professional Services', riskLevel: 'medium', status: 'pending', contractExpiry: '2026-11-30' },
];

const mockAssessments = [
    { id: 'VRA-001', vendor: 'Acme Cloud Services', assessor: 'Security Team', score: 72, status: 'completed', date: '2026-01-20' },
    { id: 'VRA-002', vendor: 'DataSync Solutions', assessor: 'CISO Office', score: 54, status: 'pending', date: '2026-03-10' },
    { id: 'VRA-003', vendor: 'SecureAuth Ltd', assessor: 'Security Team', score: 91, status: 'completed', date: '2025-12-15' },
];

const riskColor: Record<string, string> = {
    critical: 'bg-red-200 text-red-900',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
};
const statusColor: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    'under-review': 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

export default async function ThirdPartyCompliancePage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let dbVendorCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        dbVendorCount = await db.collection('third_party_vendors').countDocuments();
    } catch { /* use mock data */ }

    const highRiskVendors = mockVendors.filter(v => v.riskLevel === 'high' || v.riskLevel === 'critical').length;
    const approvedVendors = mockVendors.filter(v => v.status === 'approved').length;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                        <BookLock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Third-Party Compliance</h1>
                        <p className="text-muted-foreground mt-1">Manage vendor risks, supplier audits, and third-party contract compliance.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Total Vendors</CardDescription>
                            <CardTitle className="text-4xl">{mockVendors.length + dbVendorCount}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">registered third parties</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Approved</CardDescription>
                            <CardTitle className="text-4xl">{approvedVendors}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-green-600">{Math.round((approvedVendors / mockVendors.length) * 100)}% approval rate</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> High / Critical Risk</CardDescription>
                            <CardTitle className="text-4xl">{highRiskVendors}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-red-600">vendors requiring close monitoring</p></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Clock className="h-4 w-4" /> Pending Assessments</CardDescription>
                            <CardTitle className="text-4xl">{mockAssessments.filter(a => a.status === 'pending').length}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">risk assessments in queue</p></CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-amber-500" /> Vendor Register</CardTitle>
                        <CardDescription>All registered vendors with their risk classification and contract status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Vendor Name</TableHead><TableHead>Category</TableHead>
                                    <TableHead>Risk Level</TableHead><TableHead>Status</TableHead><TableHead>Contract Expiry</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockVendors.map(vendor => (
                                    <TableRow key={vendor.id}>
                                        <TableCell className="font-mono text-xs">{vendor.id}</TableCell>
                                        <TableCell className="font-medium">{vendor.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{vendor.category}</TableCell>
                                        <TableCell><Badge className={riskColor[vendor.riskLevel]}>{vendor.riskLevel}</Badge></TableCell>
                                        <TableCell><Badge className={statusColor[vendor.status]}>{vendor.status}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{vendor.contractExpiry}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-blue-500" /> Risk Assessments</CardTitle>
                        <CardDescription>Results of third-party risk assessments with scoring.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead><TableHead>Vendor</TableHead><TableHead>Assessor</TableHead>
                                    <TableHead>Score</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockAssessments.map(a => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-mono text-xs">{a.id}</TableCell>
                                        <TableCell className="font-medium">{a.vendor}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{a.assessor}</TableCell>
                                        <TableCell>
                                            <Badge className={a.score >= 80 ? 'bg-green-100 text-green-800' : a.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                                                {a.score}/100
                                            </Badge>
                                        </TableCell>
                                        <TableCell><Badge className={statusColor[a.status]}>{a.status}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{a.date}</TableCell>
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
