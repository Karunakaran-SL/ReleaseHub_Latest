import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import OperationalComplianceSettings from '../../../../plugins/Compliance-Operational/ui/settings/page';

export default async function OperationalComplianceSettingsPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Operational Compliance Settings</h2>
                    <p className="text-muted-foreground mt-2">Configure SOP categories, approval thresholds, and deviation notifications.</p>
                </div>
                <OperationalComplianceSettings />
            </div>
        </DashboardLayout>
    );
}
