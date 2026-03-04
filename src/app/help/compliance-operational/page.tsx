import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserCheck, ClipboardList, AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react';

export default async function OperationalComplianceHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <main className="flex-1 p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Operational Compliance Help</h1>
                            <p className="text-muted-foreground">Manage SOPs, process deviations, and approval workflows.</p>
                        </div>
                    </div>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Overview</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground"><p>Operational Compliance tracks Standard Operating Procedures (SOPs) and any deviations from them. It ensures that teams follow approved processes and that exceptions are properly documented and remediated.</p></CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Standard Operating Procedures</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>SOPs should be registered with:</p>
                            <ul className="list-disc list-inside space-y-1"><li><strong>Owner</strong>: The team responsible for maintaining the SOP</li><li><strong>Version</strong>: Track revisions over time</li><li><strong>Status</strong>: Draft → In Review → Approved</li><li><strong>Review Cycle</strong>: When the SOP must be reviewed again</li></ul>
                            <p className="mt-2">Add or configure SOP categories in <strong>Settings → Operational Compliance</strong>.</p>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Process Deviations</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>When a team cannot follow the approved SOP, a deviation must be logged with:</p>
                            <ul className="list-disc list-inside space-y-1"><li>The SOP that was deviated from</li><li>Reason for the deviation</li><li>Severity (High, Medium, Low)</li><li>Remediation plan and target date</li></ul>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Best Practices</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1"><li>Review all SOPs on a defined cycle (at minimum annually).</li><li>Require two approvers for high-risk SOPs.</li><li>Track all deviations — even emergency exceptions — to closure.</li></ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </DashboardLayout>
    );
}
