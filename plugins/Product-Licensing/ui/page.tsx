import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, BoxSelect, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clientPromise from '@/lib/mongodb';
import { hasPermission } from '@/lib/rbac';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

async function getProductLicenses() {
    try {
        const client = await clientPromise;
        const db = client.db();
        return await db.collection('product_licensing').find({}).sort({ createdAt: -1 }).toArray();
    } catch { return []; }
}

async function getProductsMap() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const products = await db.collection('products').find({}, { projection: { name: 1 } }).toArray();
        return products.reduce((acc: any, p: any) => ({ ...acc, [p._id.toString()]: p.name }), {});
    } catch { return {}; }
}

export default async function ProductLicensingPluginPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    const canManage = user ? hasPermission(user.roles || user.role, 'product_licensing_manage', 'edit') : false;

    const [licenses, productsMap] = await Promise.all([
        getProductLicenses(),
        getProductsMap()
    ]);

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

                <div className="flex items-center justify-between mb-8 relative">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <BoxSelect className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                Product Licensing
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Configure licensing models per product.
                        </p>
                    </div>
                </div>

                <Accordion type="single" collapsible defaultValue="item-1" className="mb-8 bg-card border rounded-lg px-4">
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-purple-500" />
                                Plugin Information
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                            This section defines the specific licensing models associated with each product. It dictates how a product's license is managed, such as whether it's an online or offline model, what entitlements are included, and its validity period.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Configured Products</CardDescription>
                            <CardTitle className="text-3xl font-bold">{licenses.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">Requirements</CardDescription>
                            <CardTitle className="text-lg flex items-center gap-2 mt-2">
                                {canManage ? (
                                    <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" /> Manage Access</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground"><Shield className="w-3 h-3 mr-1" /> Read Only Access</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BoxSelect className="h-5 w-5 text-purple-500" /> Licensing Configurations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>License Model</TableHead>
                                    <TableHead>Compliance</TableHead>
                                    <TableHead>Validity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {licenses.length > 0 ? (
                                    licenses.map((pl: any) => (
                                        <TableRow key={pl._id.toString()}>
                                            <TableCell className="font-medium">{productsMap[pl.product_id] || pl.product_id || 'Unknown Product'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{pl.license_model}</Badge>
                                            </TableCell>
                                            <TableCell>{pl.compliance}</TableCell>
                                            <TableCell>{pl.validity}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No product licensing configurations found.
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
