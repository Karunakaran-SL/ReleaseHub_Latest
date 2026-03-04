import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Eye, Pencil, Trash2, Shield } from 'lucide-react';

const permissions: Record<string, string[]> = {
    admin: ['read', 'write', 'delete', 'manage-users'],
    editor: ['read', 'write'],
    viewer: ['read'],
};

const permissionDescriptions: Record<string, string> = {
    read: 'View products, specifications, deployments data',
    write: 'Create and edit products, specifications, deployments',
    delete: 'Remove products, specifications, deployments',
    'manage-users': 'Assign roles and manage user permissions',
};

const permissionIcons: Record<string, React.ReactNode> = {
    read: <Eye className="h-4 w-4 text-blue-500" />,
    write: <Pencil className="h-4 w-4 text-amber-500" />,
    delete: <Trash2 className="h-4 w-4 text-red-500" />,
    'manage-users': <Users className="h-4 w-4 text-violet-500" />,
};

const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    editor: 'bg-amber-100 text-amber-800 border-amber-200',
    viewer: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default async function PluginUsersPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 text-violet-500" /> User Management
                    </h2>
                    <p className="text-muted-foreground mt-1">Role-based access control for the Sample Plugin.</p>
                </div>

                {/* Current User */}
                <Card className="shadow-sm border-border/50 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Your Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-medium">{user?.username || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">Current user</p>
                            </div>
                            <Badge className={`${roleBadgeColors[user?.roles?.[0] || 'viewer']} capitalize px-3 py-1`}>
                                {user?.roles?.[0] || 'viewer'}
                            </Badge>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {permissions[user?.roles?.[0] as keyof typeof permissions || 'viewer']?.map(perm => (
                                <Badge key={perm} variant="outline" className="gap-1.5 px-2.5 py-1">
                                    {permissionIcons[perm]} {perm}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Role Matrix */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-violet-500" /> Role Permission Matrix</CardTitle>
                        <CardDescription>Overview of permissions granted to each role.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Role</TableHead>
                                    <TableHead>Permission</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(permissions).map(([role, perms]) => (
                                    perms.map((perm, idx) => (
                                        <TableRow key={`${role}-${perm}`}>
                                            {idx === 0 && (
                                                <TableCell rowSpan={perms.length} className="align-top font-medium">
                                                    <Badge className={`${roleBadgeColors[role]} capitalize px-3 py-1`}>
                                                        {role}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {permissionIcons[perm]}
                                                    <span className="font-mono text-sm">{perm}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {permissionDescriptions[perm]}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
