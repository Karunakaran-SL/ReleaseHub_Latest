
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, PlusCircle } from 'lucide-react';
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

interface Specification {
    _id: string;
    name: string;
    hw_type?: { id: string; name: string; };
    vendor?: string;
    total_cpu?: number;
    memory_gb?: number;
    storage_gb?: number;
    hypervisor?: { id: string; name: string; };
    image?: string;
    service_contract_type?: { id: string; name: string; };
    contact_point_email?: string;
    contact_point_phone?: string;
    network_cards?: { id: string; name: string; }[];
    plug_power_cords?: { id: string; name: string; }[];
    custom_fields?: { key: string; value: string; }[];
}

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

    if (!specification) {
         return (
             <DashboardLayout user={user}>
                <div className="flex justify-center items-center h-full">
                    <p>Specification not found.</p>
                </div>
            </DashboardLayout>
        )
    }
    
    const networkCardsDisplay = specification.network_cards?.map(c => c.name).join(', ') || 'N/A';
    const plugPowerCordsDisplay = specification.plug_power_cords?.map(p => p.name).join(', ') || 'N/A';
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;


    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle>View Specification: {specification.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <div>
                                    <Label htmlFor="hw-name">HW Name</Label>
                                    <Input id="hw-name" value={specification.name || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="hw-type">HW Type</Label>
                                    <Input id="hw-type" value={specification.hw_type?.name || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="vendor">Vendor</Label>
                                    <Input id="vendor" value={specification.vendor || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="image">Image</Label>
                                    <Input id="image" value={specification.image || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="service-contract-type">Service Contract Type</Label>
                                    <Input id="service-contract-type" value={specification.service_contract_type?.name || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="contact-email">Contact Point Email</Label>
                                    <Input id="contact-email" value={specification.contact_point_email || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="contact-phone">Contact Point Phone</Label>
                                    <Input id="contact-phone" value={specification.contact_point_phone || ''} disabled />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">HW Resources</h3>
                                <div>
                                    <Label htmlFor="total-cpu">Total CPU</Label>
                                    <Input id="total-cpu" value={specification.total_cpu || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="memory">Memory (GB)</Label>
                                    <Input id="memory" value={specification.memory_gb || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="storage">Storage (GB)</Label>
                                    <Input id="storage" value={specification.storage_gb || ''} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="network-cards">Network Cards type</Label>
                                    <Input id="network-cards" value={networkCardsDisplay} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="plug-power-cord">Plug/Power Cord Type</Label>
                                    <Input id="plug-power-cord" value={plugPowerCordsDisplay} disabled />
                                </div>
                                <div>
                                    <Label htmlFor="hypervisor">Hypervisor</Label>
                                    <Input id="hypervisor" value={specification.hypervisor?.name || 'N/A'} disabled />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mt-6">Custom Fields</h3>
                                    <div className="space-y-2">
                                        {specification.custom_fields && specification.custom_fields.length > 0 ? (
                                            specification.custom_fields.map((field, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input value={field.key} disabled />
                                                    <Input value={field.value} disabled />
                                                </div>
                                            ))
                                        ) : <p className="text-sm text-muted-foreground">No custom fields.</p>}
                                    </div>
                                </div>
                            </div>
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
