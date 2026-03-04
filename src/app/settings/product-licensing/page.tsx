
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import ProductLicensingSettings from '../../../../plugins/Product-Licensing/ui/settings/page';

export default async function ProductLicensingSettingsPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Product Licensing Settings</h2>
                        <p className="text-muted-foreground mt-2">Configure licensing models and compliance rules per product.</p>
                    </div>
                </div>
                <ProductLicensingSettings />
            </div>
        </DashboardLayout>
    );
}
