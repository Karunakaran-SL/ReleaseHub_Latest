
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
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


function DeleteDialog({ foundation, onDeleted }: { foundation: any, onDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/platform-foundations/${foundation._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete.');
            toast({ title: 'Success', description: 'Platform Foundation deleted.'});
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
                        This action cannot be undone. This will permanently delete the platform foundation "{foundation.name}".
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


export default function PlatformFoundationsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [foundations, setFoundations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    const fetchFoundations = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/platform-foundations');
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            setFoundations(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser().then(setUser);
        fetchFoundations();
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Platform Foundations</h1>
                        <p className="text-muted-foreground">Manage your saved platform configurations.</p>
                    </div>
                    <Button asChild>
                        <Link href="/platform-engineering/platform-builder">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Foundation
                        </Link>
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Saved Foundations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Specification</TableHead>
                                    <TableHead>Kubernetes</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin" /></TableCell></TableRow>
                                ) : foundations.length > 0 ? (
                                    foundations.map(f => (
                                        <TableRow key={f._id}>
                                            <TableCell className="font-medium">{f.name}</TableCell>
                                            <TableCell>{f.specification?.name || 'N/A'}</TableCell>
                                            <TableCell>{f.kubernetes?.distribution || 'N/A'}</TableCell>
                                            <TableCell>{format(new Date(f.createdAt), 'PPP')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild><Link href={`/platform-engineering/platform-foundations/${f._id}/view`}>View</Link></Button>
                                                <Button variant="outline" size="sm" className="ml-2" asChild><Link href={`/platform-engineering/platform-foundations/${f._id}/edit`}>Edit</Link></Button>
                                                <DeleteDialog foundation={f} onDeleted={fetchFoundations} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">No platform foundations found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
