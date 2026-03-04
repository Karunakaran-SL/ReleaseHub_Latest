import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Box, FileText, Rocket, Users, CheckCircle2, Shield, Eye, Pencil, Trash2 } from 'lucide-react';
import clientPromise from '@/lib/mongodb';

async function getProducts() {
    try {
        const client = await clientPromise;
        const db = client.db();
        return await db.collection('products').find({}).toArray();
    } catch { return []; }
}

async function getSpecifications() {
    try {
        const client = await clientPromise;
        const db = client.db();
        return await db.collection('specifications').find({}).toArray();
    } catch { return []; }
}

async function getDeployments() {
    try {
        const client = await clientPromise;
        const db = client.db();
        return await db.collection('deployments').find({}).sort({ createdAt: -1 }).toArray();
    } catch { return []; }
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    VALIDATING: 'bg-blue-200 text-blue-800',
    VALIDATED: 'bg-indigo-200 text-indigo-800',
    RELEASED: 'bg-green-200 text-green-800',
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
};

const permissions = {
    admin: ['read', 'write', 'delete', 'manage-users'],
    editor: ['read', 'write'],
    viewer: ['read'],
};

const permissionIcons: Record<string, React.ReactNode> = {
    read: <Eye className="h-4 w-4" />,
    write: <Pencil className="h-4 w-4" />,
    delete: <Trash2 className="h-4 w-4" />,
    'manage-users': <Users className="h-4 w-4" />,
};

export default async function SamplePluginPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    const [products, specifications, deployments] = await Promise.all([
        getProducts(),
        getSpecifications(),
        getDeployments(),
    ]);

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

                <div className="flex items-center justify-between mb-8 relative">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Box className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                Sample App Plugin
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2 text-lg">
                            View Products, Specifications, Deployments and manage User Permissions.
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Box className="h-4 w-4" /> Products</CardDescription>
                            <CardTitle className="text-3xl">{products.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><FileText className="h-4 w-4" /> Specifications</CardDescription>
                            <CardTitle className="text-3xl">{specifications.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Rocket className="h-4 w-4" /> Deployments</CardDescription>
                            <CardTitle className="text-3xl">{deployments.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2"><Users className="h-4 w-4" /> Roles Defined</CardDescription>
                            <CardTitle className="text-3xl">{Object.keys(permissions).length}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Tabbed Content */}
                <Tabs defaultValue="products" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="products" className="gap-2"><Box className="h-4 w-4" /> Products</TabsTrigger>
                        <TabsTrigger value="specifications" className="gap-2"><FileText className="h-4 w-4" /> Specifications</TabsTrigger>
                        <TabsTrigger value="deployments" className="gap-2"><Rocket className="h-4 w-4" /> Deployments</TabsTrigger>
                        <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> User Mgmt</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products">
                        <Card className="shadow-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Box className="h-5 w-5 text-indigo-500" /> Products</CardTitle>
                                <CardDescription>All registered products from the backend API.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Owner Email</TableHead>
                                            <TableHead>Deployment Type</TableHead>
                                            <TableHead>Approval</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No products found.</TableCell></TableRow>
                                        ) : products.map((p: any) => (
                                            <TableRow key={p._id}>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell>{p.owner}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{p.owner_email}</TableCell>
                                                <TableCell>{p.deployment_type?.name || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge className={p.approval_needed ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}>
                                                        {p.approval_needed ? 'Required' : 'Not Required'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="specifications">
                        <Card className="shadow-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-500" /> Specifications</CardTitle>
                                <CardDescription>All registered hardware/cluster specifications.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>HW Type</TableHead>
                                            <TableHead>Vendor</TableHead>
                                            <TableHead>Contact Email</TableHead>
                                            <TableHead>Hypervisor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {specifications.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No specifications found.</TableCell></TableRow>
                                        ) : specifications.map((s: any) => (
                                            <TableRow key={s._id}>
                                                <TableCell className="font-medium">{s.name}</TableCell>
                                                <TableCell>{s.hw_type?.name || '-'}</TableCell>
                                                <TableCell>{s.vendor || '-'}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{s.contact_point_email || '-'}</TableCell>
                                                <TableCell>{s.hypervisor?.name || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="deployments">
                        <Card className="shadow-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-blue-500" /> Deployments</CardTitle>
                                <CardDescription>All deployments sorted by most recent.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Deployment ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deployments.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No deployments found.</TableCell></TableRow>
                                        ) : deployments.map((d: any) => (
                                            <TableRow key={d._id}>
                                                <TableCell className="font-mono text-xs">{d.details?.deploymentId || d._id}</TableCell>
                                                <TableCell>{d.details?.customer || '-'}</TableCell>
                                                <TableCell>{d.productId}</TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[d.status] || 'bg-gray-200'}>{d.status}</Badge>
                                                </TableCell>
                                                <TableCell>{d.createdBy || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card className="shadow-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-violet-500" /> Role-Based Access Control</CardTitle>
                                <CardDescription>Defines which roles can perform which operations on this plugin.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Permissions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(permissions).map(([role, perms]) => (
                                            <TableRow key={role}>
                                                <TableCell className="font-medium capitalize">{role}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        {perms.map(perm => (
                                                            <Badge key={perm} variant="outline" className="gap-1.5 px-2.5 py-1">
                                                                {permissionIcons[perm]} {perm}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Your current role:</strong>{' '}
                                        <Badge className="ml-1 bg-indigo-200 text-indigo-800 capitalize">{user?.roles?.[0] || 'viewer'}</Badge>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
