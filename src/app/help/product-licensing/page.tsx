import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info, ShieldAlert, BoxSelect } from 'lucide-react';

export default async function ProductLicensingHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <BoxSelect className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                Product Licensing Help
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Documentation for tracking and managing per-product licensing models.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-purple-500" />
                                Licensing Configurations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                The Product Licensing plugin connects the products in your catalogue with specific licensing rules.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>License Model:</strong> Defines how the software is licensed (e.g. per-seat, concurrent, per-core).</li>
                                <li><strong>Compliance:</strong> Tracks the overarching compliance level for the product line.</li>
                                <li><strong>Validity:</strong> Outlines the standard term or valid window for the product's licenses.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-purple-500" />
                                Roles & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                Access to this plugin is controlled via the <code>product_licensing_manage</code> feature permission.
                            </p>
                            <p>
                                This plugin does not inject any new custom roles because the standard administrator and release engineer roles normally manage product configurations.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
