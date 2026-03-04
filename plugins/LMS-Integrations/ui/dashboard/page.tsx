import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';
import clientPromise from '@/lib/mongodb';
import Link from 'next/link';

export default async function LMSIntegrationsDashboardWidget() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username } : null;

    let configCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        configCount = await db.collection('lms_tool_configs').countDocuments();
    } catch (error) {
        console.error('LMS widget error:', error);
    }

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">LMS Integrations Overview</h2>
                    <p className="text-muted-foreground mt-1">Configure and monitor your License Management System integrations.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <Card className="shadow-sm border-l-4 border-l-slate-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> Active Configs</CardDescription>
                            <CardTitle className="text-4xl">{configCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/plugins/lms-integrations" className="text-sm border-b hover:border-b-2 transition-all">Manage Integrations →</Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
