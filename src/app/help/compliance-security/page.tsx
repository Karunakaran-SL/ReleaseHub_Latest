import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, ShieldCheck, AlertTriangle, BookOpen, CheckCircle2, HelpCircle } from 'lucide-react';

export default async function SecurityComplianceHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <main className="flex-1 p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Security Compliance Help</h1>
                            <p className="text-muted-foreground">Learn how to manage security controls, track incidents, and maintain compliance posture.</p>
                        </div>
                    </div>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Overview</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>The Security Compliance plugin helps you track and enforce security controls across your organization. It provides visibility into your overall compliance posture, open incidents, and control health.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Security Controls</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Controls</strong> are specific security measures you track (e.g., MFA, encryption, network segmentation).</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li><strong>Compliant</strong> — control is implemented and verified.</li>
                                <li><strong>In Review</strong> — control is being assessed.</li>
                                <li><strong>Non-Compliant</strong> — control is missing or failing. Remediation required.</li>
                            </ul>
                            <p className="mt-2">Go to <strong>Settings → Security Compliance</strong> to add, enable, or disable controls.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Security Incidents</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>Log security incidents as they are discovered. Each incident has a severity (Critical, High, Medium, Low) and status (Open, Investigating, Resolved).</p>
                            <p>Use the API <code className="bg-muted px-1 rounded">POST /api/plugins/compliance-security</code> with <code className="bg-muted px-1 rounded">type: "incident"</code> to log new incidents programmatically.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Best Practices</CardTitle></CardHeader>
                        <CardContent className="space-y-1 text-sm text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Review all controls quarterly and update their status.</li>
                                <li>Assign owners to each control for accountability.</li>
                                <li>Escalate critical incidents within 24 hours.</li>
                                <li>Link incidents back to the control that failed.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </DashboardLayout>
    );
}
