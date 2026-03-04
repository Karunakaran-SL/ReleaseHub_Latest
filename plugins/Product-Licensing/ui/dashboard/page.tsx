import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BoxIcon } from 'lucide-react';
import clientPromise from '@/lib/mongodb';
import Link from 'next/link';

export default async function ProductLicensingDashboardWidget() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let configCount = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        configCount = await db.collection('product_licensing').countDocuments();
    } catch (error) {
        console.error('Product Licensing widget error:', error);
    }

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Product Licensing Overview</h2>
                    <p className="text-muted-foreground mt-1">Configure licensing models for your managed products.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <Card className="shadow-sm border-l-4 border-l-orange-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><BoxIcon className="h-4 w-4" /> Configured Products</CardDescription>
                            <CardTitle className="text-4xl">{configCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/plugins/product-licensing" className="text-sm border-b hover:border-b-2 transition-all">Manage Configurations →</Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
