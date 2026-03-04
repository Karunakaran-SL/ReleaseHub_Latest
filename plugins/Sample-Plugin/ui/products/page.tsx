import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Box } from 'lucide-react';
import clientPromise from '@/lib/mongodb';

export default async function PluginProductsPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;

    let products: any[] = [];
    try {
        const client = await clientPromise;
        const db = client.db();
        products = await db.collection('products').find({}).toArray();
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Box className="h-6 w-6 text-indigo-500" /> Products View
                    </h2>
                    <p className="text-muted-foreground mt-1">All registered products from the backend API.</p>
                </div>

                <Card className="shadow-sm border-border/50">
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Owner Email</TableHead>
                                    <TableHead>Deployment Type</TableHead>
                                    <TableHead>Git Repo</TableHead>
                                    <TableHead>Approval</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No products found.</TableCell></TableRow>
                                ) : products.map((p: any) => (
                                    <TableRow key={p._id}>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>{p.owner}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{p.owner_email}</TableCell>
                                        <TableCell>{p.deployment_type?.name || '-'}</TableCell>
                                        <TableCell className="text-sm font-mono truncate max-w-[200px]">{p.git_repo || '-'}</TableCell>
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
            </div>
        </DashboardLayout>
    );
}
