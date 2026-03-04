import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info, ShieldAlert, Key } from 'lucide-react';

export default async function LicenseUsageHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Key className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                License Usage Help
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Documentation for tracking and managing software licenses.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-indigo-500" />
                                Inventory Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                The License Usage plugin provides a centralized inventory of all software licenses.
                                Effective license management is crucial for ensuring compliance and optimizing software expenditure.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Status Tracking:</strong> Monitor licenses as Active, Expired, or Deprecated.</li>
                                <li><strong>Ownership:</strong> See which teams or individuals own specific licenses.</li>
                                <li><strong>License Types:</strong> Differentiate between subscription, perpetual, and open-source licenses.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-indigo-500" />
                                Roles & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                Access to this plugin is controlled via the <code>license_usage_manage</code> feature permission.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>license_auditor:</strong> A dedicated role created by this plugin that grants view-only access.</li>
                                <li><strong>View Access:</strong> Allows users to see the inventory list and dashboard widgets.</li>
                                <li><strong>Manage Access:</strong> Provides the ability to create, edit, or delete license entries.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
