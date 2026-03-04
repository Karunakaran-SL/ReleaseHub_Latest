import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, ShieldAlert, Settings2 } from 'lucide-react';

export default async function LMSIntegrationsHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <Settings2 className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                LMS Integrations Help
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Documentation for setting up external License Management connections.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-teal-500" />
                                Available Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                ReleaseHub supports integration with several industry-leading License Management Systems (LMS) to automate compliance scanning and report generation.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>FOSSology & ORT:</strong> Pipeline-native robust scanners.</li>
                                <li><strong>Aikido & Snipe-IT:</strong> Platforms with asset/security management combined.</li>
                                <li><strong>Language Specific:</strong> Tools like Licensee (Ruby) and go-licenses (Go).</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-teal-500" />
                                Roles & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                Access to configure these integrations is controlled via the <code>lms_integration_manage</code> feature permission.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>lms_admin:</strong> A dedicated role created by this plugin that grants full configuration access.</li>
                                <li><strong>View Access:</strong> Allows users to see which integrations are currently active.</li>
                                <li><strong>Manage Access:</strong> Provides the ability to set API keys and connection URLs for external tools.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
