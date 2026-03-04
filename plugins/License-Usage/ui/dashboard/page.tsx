import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Key, FileWarning } from 'lucide-react';
import clientPromise from '@/lib/mongodb';
import Link from 'next/link';

export default async function LicenseUsageDashboardWidget() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let activeCount = 0;
    let totalCount = 0;

    try {
        const client = await clientPromise;
        const db = client.db();
        totalCount = await db.collection('licenses').countDocuments();
        activeCount = await db.collection('licenses').countDocuments({ status: 'ACTIVE' });
    } catch (error) {
        console.error('License usage widget error:', error);
    }

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">License Usage Overview</h2>
                    <p className="text-muted-foreground mt-1">Track and manage your software license inventory.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <Card className="shadow-sm border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Key className="h-4 w-4" /> Total Licenses</CardDescription>
                            <CardTitle className="text-4xl">{totalCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/plugins/license-usage" className="text-sm border-b hover:border-b-2 transition-all">View Inventory →</Link>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-emerald-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><BarChart className="h-4 w-4" /> Active Licenses</CardDescription>
                            <CardTitle className="text-4xl">{activeCount}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
