
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbTenant } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2, Rocket } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

interface SdkApp {
    _id: string;
    projectName: string;
    environmentType?: string;
    createdAt: string;
    tenantId?: string;
    status: 'PROVISIONING' | 'READY' | 'FAILED';
    dependencies: any[];
    version?: string;
}

const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    READY: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
};

function DeleteDialog({ app, onDeleted }: { app: SdkApp, onDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteComment, setDeleteComment] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const { toast } = useToast();

    const handleDelete = async () => {
        if (deleteConfirmationText !== 'delete' || !deleteComment) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please type "delete" and provide a comment to confirm deletion.'
            });
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/platform-engineering/sdk-apps/${app._id}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });
            if (!res.ok) throw new Error('Failed to delete app configuration.');
            toast({ title: 'Success', description: 'App configuration deleted.' });
            onDeleted();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;

    return (
        <AlertDialog onOpenChange={(open) => { if (!open) { setDeleteComment(''); setDeleteConfirmationText(''); }}}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the configuration for "{app.projectName}".
                        Provide a reason and type <strong>delete</strong> to confirm.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`delete-comment-${app._id}`}>Reason for Deletion *</Label>
                        <Textarea id={`delete-comment-${app._id}`} placeholder="Audit comment..." value={deleteComment} onChange={(e) => setDeleteComment(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`delete-confirmation-${app._id}`}>Type "delete" to confirm *</Label>
                        <Input id={`delete-confirmation-${app._id}`} value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleteButtonDisabled}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function SdkAppsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [apps, setApps] = useState<SdkApp[]>([]);
    const [tenants, setTenants] = useState<Record<string, CmdbTenant>>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const fetchApps = async () => {
        setLoading(true);
        try {
            const [appsRes, tenantsRes] = await Promise.all([
                fetch('/api/platform-engineering/sdk-apps'),
                fetch('/api/cmdb/tenants')
            ]);
            if (!appsRes.ok) throw new Error('Failed to fetch generated apps');
            setApps(await appsRes.json());
            
            if (tenantsRes.ok) {
                const tenantsData = await tenantsRes.json();
                setTenants(tenantsData.reduce((acc: any, t: CmdbTenant) => ({ ...acc, [t.id]: t }), {}));
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser().then(setUser);
        fetchApps();
    }, []);
    
    const handleOnboard = (app: SdkApp) => {
        const queryParams = new URLSearchParams({
            name: app.projectName,
            version: app.version || '1.0.0',
            tenantId: app.tenantId || '',
        });
        
        // Pass dependencies as stringified arrays
        const dependentInterfaces = app.dependencies?.map(d => d.id) || [];
        queryParams.set('dependentInterfaces', JSON.stringify(dependentInterfaces));
        
        router.push(`/cmdb/applications/create?${queryParams.toString()}`);
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Generated Applications</h1>
                        <p className="text-muted-foreground">View and manage your saved SDK project configurations.</p>
                    </div>
                    <Button asChild>
                        <Link href="/platform-engineering/sdk">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New App
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Environment Type</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin" /></TableCell></TableRow>
                                ) : apps.length > 0 ? (
                                    apps.map(app => (
                                        <TableRow key={app._id}>
                                            <TableCell className="font-medium">{app.projectName}</TableCell>
                                            <TableCell>{app.tenantId ? tenants[app.tenantId]?.name : 'N/A'}</TableCell>
                                            <TableCell className="capitalize">{app.environmentType || 'N/A'}</TableCell>
                                            <TableCell>{format(new Date(app.createdAt), 'PPP')}</TableCell>
                                            <TableCell>
                                                <Badge className={cn(statusColors[app.status] || 'bg-gray-200')}>
                                                    {app.status || 'UNKNOWN'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                 <Button variant="outline" size="sm" onClick={() => handleOnboard(app)}>
                                                    <Rocket className="mr-2 h-4 w-4"/> Onboard
                                                </Button>
                                                 <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/platform-engineering/sdk/apps/${app._id}/view`}>View</Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/platform-engineering/sdk/apps/${app._id}/edit`}>Edit</Link>
                                                </Button>
                                                <DeleteDialog app={app} onDeleted={fetchApps} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">No saved SDK app configurations found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
