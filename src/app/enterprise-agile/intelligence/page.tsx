import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import IntelligenceManager from '../../../../plugins/Enterprise-Agile/ui/intelligence/page';

export default async function IntelligencePage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <IntelligenceManager />
            </div>
        </DashboardLayout>
    );
}
