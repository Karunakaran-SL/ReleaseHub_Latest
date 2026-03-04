import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookLock, Building2, ClipboardCheck, BookOpen, CheckCircle2 } from 'lucide-react';

export default async function ThirdPartyComplianceHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <main className="flex-1 p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <BookLock className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Third-Party Compliance Help</h1>
                            <p className="text-muted-foreground">Manage vendor risks, supplier audits, and contract compliance.</p>
                        </div>
                    </div>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Overview</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground"><p>The Third-Party Compliance plugin helps you track all external vendors, service providers, and contractors. It ensures your supply chain meets your organisation's security and compliance standards.</p></CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Vendor Register</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Every vendor should be registered with:</p>
                            <ul className="list-disc list-inside space-y-1"><li><strong>Category</strong>: Cloud, Data Processing, Identity, etc.</li><li><strong>Risk Level</strong>: Critical, High, Medium, Low</li><li><strong>Status</strong>: Pending, Approved, Under Review</li><li><strong>Contract Expiry</strong>: When the vendor contract expires</li></ul>
                            <p className="mt-2">Configure risk tier definitions in <strong>Settings → Third-Party Compliance</strong>.</p>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Risk Assessments</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Risk assessments score a vendor on a 0-100 scale. Use score bands to determine what action is required:</p>
                            <ul className="list-disc list-inside space-y-1"><li><strong>≥ 80</strong>: Low risk — standard onboarding</li><li><strong>60-79</strong>: Medium risk — legal review required</li><li><strong>40-59</strong>: High risk — CISO approval required</li><li><strong>&lt; 40</strong>: Critical — block onboarding</li></ul>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Best Practices</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1"><li>Assess all Critical/High-risk vendors annually.</li><li>Set contract expiry reminders to avoid lapses in coverage.</li><li>Re-assess vendors when their service scope changes significantly.</li></ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </DashboardLayout>
    );
}
