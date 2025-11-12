
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '../../../dashboard-layout';
import type { User, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Camera, Settings, Loader2 } from 'lucide-react';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';
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


interface SelectOption {
    _id: string;
    id: string;
    name: string;
}

export default function ViewProductPage() {
    const [user, setUser] = useState<User | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [deleteComment, setDeleteComment] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [workflows, setWorkflows] = useState<SelectOption[]>([]);
    const [cmdbItems, setCmdbItems] = useState<SelectOption[]>([]);
    const [complianceChecks, setComplianceChecks] = useState<SelectOption[]>([]);
    const [deploymentTypes, setDeploymentTypes] = useState<SelectOption[]>([]);
    const [specifications, setSpecifications] = useState<SelectOption[]>([]);

    useEffect(() => {
        getUser().then(setUser);

        async function fetchData() {
            if (!id) return;
            try {
                const [productRes, workflowsRes, cmdbRes, complianceRes, deploymentRes, specificationsRes] = await Promise.all([
                    fetch(`/api/products/${id}`),
                    fetch('/api/workflows'),
                    fetch('/api/cmdb'),
                    fetch('/api/compliance-checks'),
                    fetch('/api/deployment-types'),
                    fetch('/api/specifications'),
                ]);

                if (!productRes.ok) throw new Error("Failed to fetch product details");
                
                setProduct(await productRes.json());
                setWorkflows(await workflowsRes.json());
                setCmdbItems(await cmdbRes.json());
                setComplianceChecks(await complianceRes.json());
                setDeploymentTypes(await deploymentRes.json());
                setSpecifications(await specificationsRes.json());

            } catch (error) {
                console.error("Failed to fetch data", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load data for the form.'
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
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
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Product deleted successfully.",
                });
                router.push('/products');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorData.message || "Failed to delete product.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred.",
            });
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

    if (!product) {
         return (
             <DashboardLayout user={user}>
                <div className="flex justify-center items-center h-full">
                    <p>Product not found.</p>
                </div>
            </DashboardLayout>
        )
    }

    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;

    const renderMultiSelect = (fieldName: 'custom_workflows' | 'compliance_checks' | 'specifications', allOptions: SelectOption[]) => {
        const chosenItems = (product[fieldName] || []).map(item => ({ id: item.id, label: item.name }));
        const chosenIds = new Set(chosenItems.map(item => item.id));
        const availableItems = allOptions.filter(opt => !chosenIds.has(opt.id)).map(opt => ({ id: opt.id, label: opt.name }));

        return (
            <MultiSelectListBox
                available={availableItems}
                chosen={chosenItems}
                onMoveToChosen={() => {}}
                onMoveToAvailable={() => {}}
                onMoveAllToChosen={() => {}}
                onMoveAllToAvailable={() => {}}
                disabled
            />
        );
    };


    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">View Product: {product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Part 1 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="product-name">Product Name *</Label>
                                    <Input id="product-name" value={product.name} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner-name">Owner Name *</Label>
                                    <Input id="owner-name" value={product.owner} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner-email">Owner Email *</Label>
                                    <Input id="owner-email" type="email" value={product.owner_email} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Product Image</Label>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="icon" type="button" disabled>
                                            <Camera className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="approval-needed" checked={product.approval_needed} disabled/>
                                    <Label htmlFor="approval-needed" className="font-normal">
                                        Product Level Deployment Approval is Needed
                                    </Label>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="default-workflow">Default Approval Workflow</Label>
                                    <Select value={product.default_workflow?.id} disabled>
                                        <SelectTrigger id="default-workflow">
                                            <SelectValue placeholder="Select a default workflow" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workflows.map(item => (
                                                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Custom Approval Workflow</Label>
                                    {renderMultiSelect('custom_workflows', workflows)}
                                </div>
                            </div>

                            {/* Part 2 */}
                            <div className="space-y-6">
                                 <div>
                                    <Label>Select the compliance check</Label>
                                    {renderMultiSelect('compliance_checks', complianceChecks)}
                                </div>
                                <div className="space-y-2">
                                    <Label>Deployment Type</Label>
                                    <RadioGroup 
                                        value={product.deployment_type?.id}
                                        className="flex flex-wrap items-center gap-4"
                                    >
                                        {deploymentTypes.map(type => (
                                            <div key={type.id} className="flex items-center space-x-2">
                                                <RadioGroupItem value={type.id} id={`deployment-type-${type.id}`} disabled/>
                                                <Label htmlFor={`deployment-type-${type.id}`} className="font-normal">{type.name}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="space-y-4">
                                     <div className="flex items-center gap-2">
                                        <Input id="git-repo" placeholder="Product Git Repo" value={product.git_repo} disabled/>
                                        <Button variant="outline" size="icon" type="button" disabled>
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="artifacts-repo" placeholder="Product Artifacts Repo" value={product.artifacts_repo} disabled/>
                                        <Button variant="outline" size="icon" type="button" disabled>
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="pipeline" placeholder="Product Pipeline" value={product.pipeline} disabled/>
                                        <Button variant="outline" size="icon" type="button" disabled>
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {product.deployment_type?.id === 'Deployment_Airgapped' && (
                                    <div>
                                        <h3 className="font-medium text-lg mb-2">Specifications</h3>
                                        <Label>Select Applicable HW Variants</Label>
                                        {renderMultiSelect('specifications', specifications)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2 pt-8">
                        <Button variant="outline" asChild>
                           <Link href={`/products/${id}/edit`}>UPDATE</Link>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">DELETE</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product.
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
