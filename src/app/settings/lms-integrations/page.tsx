
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import LMSIntegrationsSettings from '../../../../plugins/LMS-Integrations/ui/settings/page';

export default async function LMSIntegrationsSettingsPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight">LMS Integrations Settings</h2>
                        </div>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Manage API connections and authentication for external License Management Systems.
                        </p>
                    </div>
                </div>
                <LMSIntegrationsSettings />
            </div>
        </DashboardLayout>
    );
}
