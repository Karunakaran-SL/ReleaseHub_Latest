import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Box, FileText, Rocket, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import clientPromise from '@/lib/mongodb';
import Link from 'next/link';

export default async function SamplePluginDashboardPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let productCount = 0, specCount = 0, deploymentCount = 0, activeDeployments = 0;
    try {
        const client = await clientPromise;
        const db = client.db();
        productCount = await db.collection('products').countDocuments();
        specCount = await db.collection('specifications').countDocuments();
        deploymentCount = await db.collection('deployments').countDocuments();
        activeDeployments = await db.collection('deployments').countDocuments({ status: 'ACTIVE' });
    } catch (error) {
        console.error('Dashboard plugin data error:', error);
    }

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Sample Plugin Overview</h2>
                    <p className="text-muted-foreground mt-1">Quick summary of core data from the Sample Plugin.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-l-4 border-l-indigo-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Box className="h-4 w-4" /> Products</CardDescription>
                            <CardTitle className="text-4xl">{productCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/plugins/sample-plugin/products" className="text-sm text-indigo-600 hover:underline">View all →</Link>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-emerald-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><FileText className="h-4 w-4" /> Specifications</CardDescription>
                            <CardTitle className="text-4xl">{specCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/plugins/sample-plugin/specifications" className="text-sm text-emerald-600 hover:underline">View all →</Link>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Rocket className="h-4 w-4" /> Total Deployments</CardDescription>
                            <CardTitle className="text-4xl">{deploymentCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/plugins/sample-plugin/deployments" className="text-sm text-blue-600 hover:underline">View all →</Link>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Activity className="h-4 w-4" /> Active Deployments</CardDescription>
                            <CardTitle className="text-4xl">{activeDeployments}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-500" /> Running smoothly
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Plugin Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">v1.0.0</Badge>
                            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">Data Integration Active</Badge>
                            <Badge className="bg-violet-100 text-violet-800 px-3 py-1">RBAC Enabled</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
