import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Box, FileText, Rocket, Users, Shield, LayoutGrid, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function SamplePluginHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user.id, username: user.username } : null;

    const sections = [
        {
            icon: <LayoutGrid className="h-5 w-5 text-indigo-500" />,
            title: 'Dashboard Overview',
            description: 'The Dashboard sub-page shows a quick summary of Products, Specifications, and Deployments counts. Access it from the Dashboard sidebar menu.',
            link: '/dashboard/plugins/sample-plugin',
        },
        {
            icon: <Box className="h-5 w-5 text-indigo-500" />,
            title: 'Products View',
            description: 'View all registered products with details such as owner, deployment type, git repository, and approval status. Data is fetched from the /api/products API.',
            link: '/plugins/sample-plugin/products',
        },
        {
            icon: <FileText className="h-5 w-5 text-emerald-500" />,
            title: 'Specifications',
            description: 'Browse all hardware and cluster specifications including HW type, vendor, cluster name, CPU architecture, and hypervisor information. Data is fetched from /api/specifications.',
            link: '/plugins/sample-plugin/specifications',
        },
        {
            icon: <Rocket className="h-5 w-5 text-blue-500" />,
            title: 'Deployments',
            description: 'View all deployments sorted by most recent, showing deployment ID, customer, product, specification, status, and creation info. Data is fetched from /api/deployments.',
            link: '/plugins/sample-plugin/deployments',
        },
        {
            icon: <Shield className="h-5 w-5 text-violet-500" />,
            title: 'User Management',
            description: 'View the role-based access control (RBAC) matrix. Three roles are defined: Admin (full access), Editor (read + write), Viewer (read only). Your current role determines what actions you can perform.',
            link: '/plugins/sample-plugin/users',
        },
        {
            icon: <Settings className="h-5 w-5 text-gray-500" />,
            title: 'Settings',
            description: 'Access the plugin settings and configuration from the Settings sidebar menu. View plugin status, version, and data integration details.',
            link: '/settings/sample-plugin',
        },
    ];

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <HelpCircle className="h-6 w-6 text-blue-500" /> Sample Plugin Help
                    </h2>
                    <p className="text-muted-foreground mt-1">Documentation and guidance for using the Sample App Plugin.</p>
                </div>

                <Card className="shadow-sm border-border/50 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <CardHeader>
                        <CardTitle>About This Plugin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The Sample App Plugin demonstrates the full plugin extension capabilities of ReleaseHub. It adds menus under the Dashboard,
                            its own top-level menu with sub-pages, a Help entry, and a Settings entry. It fetches real data from the backend APIs
                            (Products, Specifications, Deployments) and implements role-based access control.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge className="bg-indigo-100 text-indigo-800">v1.0.0</Badge>
                            <Badge className="bg-emerald-100 text-emerald-800">API Integration</Badge>
                            <Badge className="bg-violet-100 text-violet-800">RBAC</Badge>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    {sections.map((section) => (
                        <Link key={section.title} href={section.link}>
                            <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">{section.icon} {section.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{section.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
