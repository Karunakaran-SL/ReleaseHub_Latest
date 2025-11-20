
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    READY: 'bg-green-200 text-green-800',
    ERROR: 'bg-red-200 text-red-800',
    DELETING: 'bg-gray-300 text-gray-900',
};

function DeleteDialog({ environment, onDeleted }: { environment: any, onDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/development-environments/${environment._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete environment.');
            toast({ title: 'Success', description: 'Development environment deleted.' });
            onDeleted();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsDeleting(false);
        }
    };
    
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete the environment "{environment.name}" and deprovision its resources. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export default function DevelopmentEnvironmentsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [environments, setEnvironments] = useState<any[]>([]);
    const [products, setProducts] = useState<Record<string, Product>>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    const fetchEnvironments = async () => {
        setLoading(true);
        try {
            const [envsRes, productsRes] = await Promise.all([
                fetch('/api/development-environments'),
                fetch('/api/products')
            ]);
            if (!envsRes.ok) throw new Error('Failed to fetch environments');
            setEnvironments(await envsRes.json());
            
            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData.reduce((acc: any, p: Product) => ({ ...acc, [p._id]: p }), {}));
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser().then(setUser);
        fetchEnvironments();
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Development Environments</h1>
                        <p className="text-muted-foreground">Manage on-demand environments for development and functional testing.</p>
                    </div>
                    <Button asChild>
                        <Link href="/platform-engineering/development-environments/create">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New Environment
                        </Link>
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Available Environments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin" /></TableCell></TableRow>
                                ) : environments.length > 0 ? (
                                    environments.map(env => (
                                        <TableRow key={env._id}>
                                            <TableCell className="font-medium">{env.name}</TableCell>
                                            <TableCell>{products[env.productId]?.name || 'N/A'}</TableCell>
                                            <TableCell>{format(new Date(env.createdAt), 'PPP')}</TableCell>
                                            <TableCell>
                                                <Badge className={cn(statusColors[env.status] || 'bg-gray-200')}>
                                                    {env.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild><Link href={`/platform-engineering/development-environments/${env._id}/view`}>View</Link></Button>
                                                <Button variant="outline" size="sm" className="ml-2" asChild><Link href={`/platform-engineering/development-environments/${env._id}/edit`}>Edit</Link></Button>
                                                <DeleteDialog environment={env} onDeleted={fetchEnvironments} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">No development environments found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
