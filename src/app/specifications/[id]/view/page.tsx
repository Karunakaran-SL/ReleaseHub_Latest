

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Specification } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { DiagramDisplay } from '../../_components/diagram-display';

export default function ViewSpecificationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [specification, setSpecification] = useState<Specification | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    
    const [deleteComment, setDeleteComment] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    const specObject = useMemo(() => {
        if (!specification) return null;
        return specification;
    }, [specification]);

    useEffect(() => {
        getUser().then(setUser);

        async function fetchSpecification() {
            if (!id) return;
            try {
                const res = await fetch(`/api/specifications/${id}`);
                if (!res.ok) throw new Error("Failed to fetch specification details");
                const data = await res.json();
                setSpecification(data);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load specification data.'
                });
            } finally {
                setLoading(false);
            }
        }
        fetchSpecification();
    }, [id, toast]);

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
            const response = await fetch(`/api/specifications/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });

            if (response.ok) {
                toast({ title: "Success", description: "Specification deleted successfully." });
                router.push('/specifications');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to delete specification." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
             <DashboardLayout user={user}>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    if (!specification || !specObject) {
         return (
             <DashboardLayout user={user}>
                <div className="flex justify-center items-center h-full">
                    <p>Specification not found or data is corrupt.</p>
                </div>
            </DashboardLayout>
        )
    }
    
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;
    const networkCardsDisplay = specObject.network_cards?.map((c: any) => c.name).join(', ') || 'N/A';
    const plugPowerCordsDisplay = specObject.plug_power_cords?.map((p: any) => p.name).join(', ') || 'N/A';
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>View Specification: {specification.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Details</h3>
                                <div><Label>HW Name</Label><Input value={specObject.name || ''} disabled /></div>
                                <div><Label>HW Type</Label><Input value={specObject.hw_type?.name || ''} disabled /></div>
                                <div><Label>Vendor</Label><Input value={specObject.vendor || ''} disabled /></div>
                                <div><Label>Image URL</Label><Input value={specObject.image || ''} disabled /></div>
                                <div><Label>Service Contract</Label><Input value={specObject.service_contract_type?.name || ''} disabled /></div>
                                <div><Label>Contact Email</Label><Input value={specObject.contact_point_email || ''} disabled /></div>
                                <div><Label>Contact Phone</Label><Input value={specObject.contact_point_phone || ''} disabled /></div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">HW Resources & Connectivity</h3>
                                <div><Label>Total CPU</Label><Input value={specObject.total_cpu || ''} disabled /></div>
                                <div><Label>Memory (GB)</Label><Input value={specObject.memory_gb || ''} disabled /></div>
                                <div><Label>Storage (GB)</Label><Input value={specObject.storage_gb || ''} disabled /></div>
                                <div><Label>Network Cards</Label><Input value={networkCardsDisplay} disabled /></div>
                                <div><Label>Power Cords</Label><Input value={plugPowerCordsDisplay} disabled /></div>
                                <div><Label>Hypervisor</Label><Input value={specObject.hypervisor?.name || 'N/A'} disabled /></div>
                            </div>
                            {(specObject.custom_fields?.length > 0) && (
                                <div className="md:col-span-2 space-y-2">
                                <h3 className="font-semibold text-lg">Custom Fields</h3>
                                <div className="space-y-2">
                                    {specObject.custom_fields.map((field: any, index: number) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input value={field.key} disabled className="font-semibold" />
                                            <Input value={field.value} disabled />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                           <Link href={`/specifications/${id}/edit`}>UPDATE</Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">DELETE</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the specification.
                                        Please type <strong>delete</strong> to confirm.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delete-comment">Reason for Deletion *</Label>
                                        <Textarea id="delete-comment" value={deleteComment} onChange={(e) => setDeleteComment(e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="delete-confirmation">Type "delete" to confirm *</Label>
                                        <Input id="delete-confirmation" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleteButtonDisabled} className="bg-destructive hover:bg-destructive/90">
                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
                 <Card className="mt-6">
                    <CardHeader><CardTitle>Visualization & Raw JSON</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-[30rem]"><DiagramDisplay specJson={JSON.stringify(specObject, null, 2)} /></div>
                        <div>
                           <Label htmlFor="json-output">Specification JSON</Label>
                           <Textarea id="json-output" value={JSON.stringify(specObject, null, 2)} readOnly rows={24} className="font-mono text-xs"/>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
