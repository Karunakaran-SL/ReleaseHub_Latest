
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Deployment, Product, Specification, CmdbComponent } from '@/lib/definitions';
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
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
};


interface Hypervisor {
    _id: string;
    name: string;
}

export default function ViewDeploymentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [deployment, setDeployment] = useState<Deployment | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [specification, setSpecification] = useState<Specification | null>(null);
    const [hypervisor, setHypervisor] = useState<Hypervisor | null>(null);
    const [components, setComponents] = useState<CmdbComponent[]>([]);
    
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

        async function fetchDetails() {
            try {
                const deploymentRes = await fetch(`/api/deployments/${id}`);
                if (!deploymentRes.ok) throw new Error('Failed to fetch deployment');
                const deploymentData: Deployment = await deploymentRes.json();
                setDeployment(deploymentData);

                // Fetch related data
                const [productRes, specRes, hypervisorRes, componentsRes] = await Promise.all([
                    fetch(`/api/products/${deploymentData.productId}`),
                    fetch(`/api/specifications/${deploymentData.specificationId}`),
                    fetch(`/api/settings/specifications/hypervisors/${deploymentData.hypervisorId}`),
                    Promise.all(deploymentData.foundationComponentIds.map(compId => fetch(`/api/cmdb/components/${compId}`)))
                ]);
                
                if (productRes.ok) setProduct(await productRes.json());
                if (specRes.ok) setSpecification(await specRes.json());
                if (hypervisorRes.ok) setHypervisor(await hypervisorRes.json());
                
                const componentData = await Promise.all(componentsRes.map(res => res.json()));
                setComponents(componentData);
                

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();

    }, [id, toast]);
    
     const handleDelete = async () => {
        if (deleteConfirmationText !== 'delete' || !deleteComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please type "delete" and provide a comment to confirm deletion.' });
            return;
        }
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/deployments/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });

            if (response.ok) {
                toast({ title: "Success", description: "Deployment deleted successfully." });
                router.push('/fleet-management/deployment');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to delete deployment." });
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

    if (!deployment) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><p>Deployment not found.</p></div></DashboardLayout>;
    }
    
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;


    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>View Deployment: {deployment.details.deploymentId}</CardTitle>
                                <CardDescription>For customer: {deployment.details.customer}</CardDescription>
                            </div>
                            <Badge className={cn("text-base", statusColors[deployment.status] || 'bg-gray-200')}>
                                {deployment.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Configuration</h3>
                            <div><Label>Product</Label><Input value={product?.name || 'Loading...'} disabled /></div>
                            <div><Label>Specification</Label><Input value={specification?.name || 'Loading...'} disabled /></div>
                            <div><Label>Hypervisor</Label><Input value={hypervisor?.name || 'Loading...'} disabled /></div>
                            <div>
                                <Label>Foundation Components</Label>
                                <div className="p-2 border rounded-md min-h-[6rem] space-y-1 text-sm bg-muted/50">
                                    {components.map(c => <div key={c._id}>{c.name}</div>)}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg border-b pb-2">Details</h3>
                             <div><Label>Deployment ID</Label><Input value={deployment.details.deploymentId} disabled /></div>
                             <div><Label>Customer</Label><Input value={deployment.details.customer} disabled /></div>
                             <div><Label>Factory</Label><Input value={deployment.details.factory || 'N/A'} disabled /></div>
                             <div><Label>Location</Label><Input value={`${deployment.details.region}, ${deployment.details.country}, ${deployment.details.availabilityZone}`} disabled /></div>
                             <div><Label>Created By</Label><Input value={`${deployment.createdBy} on ${format(new Date(deployment.createdAt), 'PPP')}`} disabled /></div>
                        </div>
                         <div className="md:col-span-2 space-y-4">
                             <h3 className="font-semibold text-lg border-b pb-2">Security Details</h3>
                             <div><Label>Encryption Key</Label><Textarea value={deployment.security.encryptionKey || 'Not provided'} disabled /></div>
                             <div><Label>Signing Certificate</Label><Textarea value={deployment.security.signingCert || 'Not provided'} disabled /></div>
                             <div><Label>PKI Details</Label><Textarea value={deployment.security.pkiDetails || 'Not provided'} disabled /></div>
                             <div><Label>IAM Token</Label><Input value={deployment.security.iamToken || 'Not provided'} disabled /></div>
                        </div>

                    </CardContent>
                     <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                           <Link href={`/fleet-management/deployment/${id}/edit`}>UPDATE</Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">DELETE</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this deployment.
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
