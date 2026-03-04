import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import DataComplianceSettings from '../../../../plugins/Compliance-Data/ui/settings/page';

export default async function DataComplianceSettingsPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Data Compliance Settings</h2>
                    <p className="text-muted-foreground mt-2">Configure DSAR deadlines, data retention policies, and DPO contact information.</p>
                </div>
                <DataComplianceSettings />
            </div>
        </DashboardLayout>
    );
}
