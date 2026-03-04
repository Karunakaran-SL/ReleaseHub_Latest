import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Settings, Info, CheckCircle, HelpCircle, CircleDot, Package, Settings2, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import clientPromise from '@/lib/mongodb';
import { hasPermission } from '@/lib/rbac';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const iconMap = {
    CheckCircle: <CheckCircle className="h-3 w-3" />,
    HelpCircle: <HelpCircle className="h-3 w-3" />,
    CircleDot: <CircleDot className="h-3 w-3" />,
    Package: <Package className="h-3 w-3" />,
};

const statuses = [
    { text: 'Certified', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: 'CheckCircle' },
    { text: 'In Qualification', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: 'HelpCircle' },
    { text: 'Evaluation Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: 'CircleDot' },
    { text: 'In Inventory', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: 'Package' },
];

const tools = [
    { id: 'fossology', name: 'FOSSology', desc: 'Detailed license detection and report generation.', status: statuses[0] },
    { id: 'ort', name: 'OSS Review Toolkit (ORT)', desc: 'Pipeline-native dependency and license scanning.', status: statuses[0] },
    { id: 'licensee', name: 'Licensee', desc: 'Ruby-based license file detection.', status: statuses[1] },
    { id: 'go-licenses', name: 'go-licenses', desc: 'License reports for Go dependencies.', status: statuses[2] },
    { id: 'snipe-it', name: 'Snipe-IT', desc: 'IT asset and license management platform.', status: statuses[1] },
    { id: 'glpi', name: 'GLPI', desc: 'ITSM with integrated license tracking.', status: statuses[0] },
    { id: 'aikido', name: 'Aikido', desc: 'Security scanner with license risk scoring.', status: statuses[2] }
];

async function getConfiguredTools() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const configs = await db.collection('lms_tool_configs').find({}).toArray();
        return configs.map((c: any) => c.toolId);
    } catch { return []; }
}

export default async function LMSIntegrationsPluginPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username } : null;
    const canManage = user ? hasPermission(user.role, 'lms_integration_manage', 'edit') : false;

    const configuredTools = await getConfiguredTools();

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

                <div className="flex items-center justify-between mb-8 relative">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <Settings2 className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                LMS Integrations
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Configure integration points with License Management System tools.
                        </p>
                    </div>
                </div>

                <Accordion type="single" collapsible defaultValue="item-1" className="mb-8 bg-card border rounded-lg px-4">
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-teal-500" />
                                Plugin Information
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                            This plugin provides a configuration interface for various external License Management Systems. Administrators can supply API keys, webhook URLs, and integration toggles to enable automated compliance scanning.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Configured Integrations</CardDescription>
                            <CardTitle className="text-3xl font-bold">{configuredTools.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Available Integrations</CardDescription>
                            <CardTitle className="text-3xl font-bold">{tools.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Requirements</CardDescription>
                            <CardTitle className="text-lg flex items-center gap-2 mt-2">
                                {canManage ? (
                                    <Badge className="bg-teal-100 text-teal-800"><Shield className="w-3 h-3 mr-1" /> Manage Access</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground"><Shield className="w-3 h-3 mr-1" /> Read Only Access</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map(tool => (
                        <Card key={tool.id} className="flex flex-col border-border/50 shadow-sm relative overflow-hidden">
                            {configuredTools.includes(tool.id) && (
                                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                                    <div className="absolute transform rotate-45 bg-teal-500 text-white text-[10px] font-bold py-1 right-[-35px] top-[12px] w-[120px] text-center shadow">
                                        Active
                                    </div>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                                    <Badge className={`${tool.status.color} flex items-center gap-1`}>
                                        {iconMap[tool.status.icon as keyof typeof iconMap]}
                                        <span className="hidden xl:inline">{tool.status.text}</span>
                                    </Badge>
                                </div>
                                <CardDescription className="pt-2 line-clamp-2">{tool.desc}</CardDescription>
                            </CardHeader>
                            <div className="flex-grow"></div>
                            <CardFooter className="pt-4 border-t border-border/50 bg-muted/20">
                                {canManage ? (
                                    <Button variant={configuredTools.includes(tool.id) ? "secondary" : "default"} className="w-full" asChild>
                                        <Link href={`/settings/lms-integrations`}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            {configuredTools.includes(tool.id) ? 'Manage Settings' : 'Configure Integration'}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="w-full" disabled>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Read Only
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
