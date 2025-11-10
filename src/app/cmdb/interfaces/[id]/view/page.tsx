
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
import type { User, CmdbInterface } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
import { format, parseISO } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ViewInterfacePage() {
    const [user, setUser] = useState<User | null>(null);
    const [item, setItem] = useState<CmdbInterface | null>(null);
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
        fetch(`/api/cmdb/interfaces/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch interface details");
                return res.json();
            })
            .then(setItem)
            .catch(error => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load interface data.' });
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
            const response = await fetch(`/api/cmdb/interfaces/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });

            if (response.ok) {
                toast({ title: "Success", description: "Interface deleted successfully." });
                router.push('/cmdb/interfaces');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to delete interface." });
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

    if (!item) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><p>Interface not found.</p></div></DashboardLayout>;
    }
    
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;


    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle>View Interface: {item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Basic Information</AccordionTrigger>
                                <AccordionContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><Label>Interface Name</Label><Input value={item.name} disabled /></div>
                                        <div><Label>Interface ID</Label><Input value={item.id} disabled /></div>
                                        <div><Label>Interface Type</Label><Input value={item.type.name} disabled /></div>
                                        <div><Label>Version</Label><Input value={item.version} disabled /></div>
                                        <div><Label>Source Component/Application</Label><Input value={item.source.name} disabled /></div>
                                    </div>
                                    <div><Label>Description</Label><Textarea value={item.description || 'N/A'} disabled /></div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Ownership & Documentation</AccordionTrigger>
                                <AccordionContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><Label>Owner Name</Label><Input value={item.owner_name} disabled /></div>
                                        <div><Label>Owner Email</Label><Input value={item.owner_email} disabled /></div>
                                    </div>
                                    <div><Label>Main Documentation URL</Label><Input value={item.documentation || 'N/A'} disabled /></div>
                                    <div><Label>Additional Documents</Label>
                                    {item.additional_docs && item.additional_docs.length > 0 ? (
                                        <div className="border rounded-md p-2 space-y-2">
                                            {item.additional_docs.map(doc => (
                                                <div key={doc.id}><Link href={doc.url} target="_blank" className="text-blue-500 hover:underline">{doc.name}</Link></div>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No additional documents.</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Security</AccordionTrigger>
                                <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader><CardTitle className="text-lg">Internal Security</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2">{item.security.internal.secure ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>} Is Secure</div>
                                            <div className="flex items-center gap-2">{item.security.internal.authentication ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>} Needs Authentication</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader><CardTitle className="text-lg">External Security</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                           <div className="flex items-center gap-2">{item.security.external.secure ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>} Is Secure</div>
                                            <div className="flex items-center gap-2">{item.security.external.authentication ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>} Needs Authentication</div>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>Custom Fields</AccordionTrigger>
                                <AccordionContent className="p-4 space-y-4">
                                    {item.custom_fields && item.custom_fields.length > 0 ? (
                                        item.custom_fields.map((field, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input value={field.key} disabled className="font-semibold" />
                                                <Input value={field.value} disabled />
                                            </div>
                                        ))
                                    ) : <p className="text-sm text-muted-foreground">No custom fields.</p>}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                           <Link href={`/cmdb/interfaces/${id}/edit`}>UPDATE</Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">DELETE</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the interface.
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

