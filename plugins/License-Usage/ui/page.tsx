import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, Key, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clientPromise from '@/lib/mongodb';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/rbac';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const statusColors: Record<string, string> = {
    active: 'bg-green-200 text-green-800',
    expired: 'bg-red-200 text-red-800',
    deprecated: 'bg-yellow-200 text-yellow-800',
};

async function getLicenses() {
    try {
        const client = await clientPromise;
        const db = client.db();
        return await db.collection('licenses').find({}).sort({ createdAt: -1 }).toArray();
    } catch { return []; }
}

export default async function LicenseUsagePluginPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    const canManage = user ? hasPermission(user.roles || user.role, 'license_usage_manage', 'edit') : false;

    const licenses = await getLicenses();

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

                <div className="flex items-center justify-between mb-8 relative">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Key className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                License Usage
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Centralized inventory of all software licenses in use.
                        </p>
                    </div>
                </div>

                <Accordion type="single" collapsible defaultValue="item-1" className="mb-8 bg-card border rounded-lg px-4">
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-indigo-500" />
                                Plugin Information
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                            This plugin provides a centralized inventory of all software licenses. It tracks license types, ownership, and status. It includes a custom API route for data retrieval and requires the `license_usage_manage` feature permission to view or edit.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Total Licenses</CardDescription>
                            <CardTitle className="text-3xl">{licenses.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Active</CardDescription>
                            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
                                {licenses.filter(l => l.status === 'active').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Requirements</CardDescription>
                            <CardTitle className="text-lg flex items-center gap-2 mt-2">
                                {canManage ? (
                                    <Badge className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" /> Manage Access</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground"><Shield className="w-3 h-3 mr-1" /> Read Only Access</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-indigo-500" /> License Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>License Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {licenses.length > 0 ? (
                                    licenses.map((license: any) => (
                                        <TableRow key={license._id.toString()}>
                                            <TableCell className="font-medium">{license.name}</TableCell>
                                            <TableCell>{license.type}</TableCell>
                                            <TableCell>{license.owner}</TableCell>
                                            <TableCell>
                                                <Badge className={cn('capitalize', statusColors[license.status] || 'bg-gray-200 text-gray-800')}>
                                                    {license.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No license usage data found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
