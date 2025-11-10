
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbComponent, CmdbPhase } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, Info, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
    'Not Started': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Done': 'bg-green-200 text-green-800',
    'Cancelled': 'bg-red-200 text-red-800',
    'Skipped': 'bg-yellow-200 text-yellow-800',
};

function BasicInfoBlock({ component }: { component: CmdbComponent }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="relative cursor-pointer">
                    <div className={cn("w-48 h-24 rounded-lg flex flex-col items-center justify-center transition-all duration-300 bg-blue-100 text-blue-900 ring-2 ring-blue-300")}>
                        <Info className="h-6 w-6 mb-1" />
                        <h4 className="font-bold text-center text-sm">Basic Information</h4>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Basic Information: {component.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Name</Label>
                        <Input value={component.name} disabled className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Component ID</Label>
                        <Input value={component.id} disabled className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Version</Label>
                        <Input value={component.version || 'N/A'} disabled className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Artifact Location</Label>
                        <Input value={component.artifact_location || 'N/A'} disabled className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Tenants</Label>
                        <div className="col-span-3 border rounded-md p-2 h-20 overflow-y-auto text-sm">
                            {component.tenants && component.tenants.length > 0 ? component.tenants?.map(p => <div key={p.id}>{p.name}</div>) : 'N/A'}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Provided Interfaces</Label>
                        <div className="col-span-3 border rounded-md p-2 h-20 overflow-y-auto text-sm">
                            {component.provided_interfaces && component.provided_interfaces.length > 0 ? component.provided_interfaces?.map(p => <div key={p.id}>{p.name}</div>) : 'N/A'}
                        </div>
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Dependent Interfaces</Label>
                        <div className="col-span-3 border rounded-md p-2 h-20 overflow-y-auto text-sm">
                            {component.dependent_interfaces && component.dependent_interfaces.length > 0 ? component.dependent_interfaces?.map(p => <div key={p.id}>{p.name}</div>) : 'N/A'}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Resources</Label>
                        <div className="col-span-3 grid grid-cols-3 gap-2">
                             <Input value={`CPU: ${component.resources?.cpu || 'N/A'}`} disabled />
                             <Input value={`Mem: ${component.resources?.memory || 'N/A'} GB`} disabled />
                             <Input value={`Sto: ${component.resources?.storage || 'N/A'} GB`} disabled />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Created At</Label>
                        <Input value={component.created_at ? format(parseISO(component.created_at), "yyyy-MM-dd HH:mm:ss") : 'N/A'} disabled className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Last Updated</Label>
                        <Input value={component.updated_at ? format(parseISO(component.updated_at), "yyyy-MM-dd HH:mm:ss") : 'N/A'} disabled className="col-span-3" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PhaseBlock({ phase }: { phase: CmdbPhase }) {
     return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="relative cursor-pointer">
                    <div className={cn("w-48 h-24 rounded-lg flex flex-col items-center justify-center transition-all duration-300", statusColors[phase.status] || 'bg-gray-200 text-gray-800' )}>
                        <FileText className="h-6 w-6 mb-1" />
                        <h4 className="font-bold text-center text-sm">{phase.name}</h4>
                        <p className="text-xs text-center">{phase.status || "Not Started"}</p>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{phase.name} - Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <Input value={phase.status} disabled className="col-span-3" />
                    </div>
                    {phase.fields.map(field => (
                        <div key={field.name} className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor={`field-${field.name}`} className="text-right pt-2">{field.name}</Label>
                            <div className="col-span-3 space-y-1">
                                <Input id={`field-${field.name}`} value={String(field.value) || 'Not set'} disabled />
                                {field.proof?.link && (
                                     <Link href={field.proof.link} target="_blank" className="text-xs text-blue-500 hover:underline">
                                        View Proof
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function ViewComponentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [component, setComponent] = useState<CmdbComponent | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [deleteComment, setDeleteComment] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;

        setLoading(true);
        fetch(`/api/cmdb/components/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch component details");
                return res.json();
            })
            .then(setComponent)
            .catch(error => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load component data.' });
            })
            .finally(() => setLoading(false));
    }, [id, toast]);
    
     const handleDelete = async () => {
        if (deleteConfirmationText !== 'delete' || !deleteComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please type "delete" and provide a comment to confirm deletion.' });
            return;
        }
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/cmdb/components/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });

            if (response.ok) {
                toast({ title: "Success", description: "Component deleted successfully." });
                router.push('/cmdb/components');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to delete component." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        } finally {
            setIsDeleting(false);
        }
      };


    if (loading) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    if (!component) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><p>Component not found.</p></div></DashboardLayout>;
    }
    
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;


    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">View Component: {component.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="relative flex flex-wrap items-center justify-center p-8 gap-y-8 gap-x-4">
                            <BasicInfoBlock component={component} />

                            {(component.phases && component.phases.length > 0) && <ChevronRight className="h-8 w-8 text-muted-foreground" />}
                            
                            {component.phases?.map((phase, index) => (
                                <div key={phase.id} className="flex items-center gap-4">
                                    <PhaseBlock phase={phase} />
                                    {index < (component.phases?.length || 0) - 1 && (
                                        <ChevronRight className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                           <Link href={`/cmdb/components/${id}/edit`}>UPDATE</Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">DELETE</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the component.
                                    Please type <strong>delete</strong> to confirm.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delete-comment">Reason for Deletion *</Label>
                                        <Textarea 
                                            id="delete-comment"
                                            placeholder="Provide a comment for auditing purposes."
                                            value={deleteComment}
                                            onChange={(e) => setDeleteComment(e.target.value)}
                                        />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="delete-confirmation">Type "delete" to confirm *</Label>
                                        <Input 
                                            id="delete-confirmation"
                                            value={deleteConfirmationText}
                                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDelete}
                                    disabled={isDeleteButtonDisabled}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                     {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}

    