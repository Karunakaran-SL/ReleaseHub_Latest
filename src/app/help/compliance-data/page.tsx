import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Fingerprint, Database, FileSearch, BookOpen, CheckCircle2 } from 'lucide-react';

export default async function DataComplianceHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <main className="flex-1 p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                            <Fingerprint className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Data Compliance Help</h1>
                            <p className="text-muted-foreground">Manage data assets, GDPR requests, and retention policies.</p>
                        </div>
                    </div>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Overview</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground"><p>The Data Compliance plugin tracks your data asset register, enforces classification and retention policies, and manages DSAR (Data Subject Access Requests) required by GDPR and similar regulations.</p></CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Data Asset Register</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Every data asset (database, file store, log archive) should be registered with:</p>
                            <ul className="list-disc list-inside space-y-1"><li><strong>Classification</strong>: Restricted, Confidential, Internal, Public</li><li><strong>Region</strong>: Where the data is stored</li><li><strong>Retention</strong>: How long the data must be kept</li><li><strong>Encrypted</strong>: Whether encryption at rest is enabled</li></ul>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileSearch className="h-5 w-5" /> DSAR Requests</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>GDPR gives data subjects the right to Access, Erase, Correct, or Port their data. Use the DSAR tracker to:</p>
                            <ul className="list-disc list-inside space-y-1"><li>Log each incoming request with the subject name and type</li><li>Track deadlines (default 30 days under GDPR)</li><li>Close requests when fulfilled</li></ul>
                            <p className="mt-2">Configure the DPO email and deadline in <strong>Settings → Data Compliance</strong>.</p>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Best Practices</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1"><li>Review your data asset register at least annually.</li><li>Ensure all Restricted assets are encrypted at rest.</li><li>Respond to DSAR requests within the statutory deadline.</li><li>Keep retention schedules aligned with data classification.</li></ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </DashboardLayout>
    );
}
