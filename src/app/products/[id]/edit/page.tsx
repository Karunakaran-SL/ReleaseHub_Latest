

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
import { Textarea } from '@/components/ui/textarea';

interface SelectOption {
    _id: string;
    id: string;
    name: string;
}

export default function EditProductPage() {
    const [user, setUser] = useState<User | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<Partial<Product> & { updateComment?: string }>({});
    
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [workflows, setWorkflows] = useState<SelectOption[]>([]);
    const [complianceChecks, setComplianceChecks] = useState<SelectOption[]>([]);
    const [deploymentTypes, setDeploymentTypes] = useState<SelectOption[]>([]);
    const [specifications, setSpecifications] = useState<SelectOption[]>([]);

    useEffect(() => {
        getUser().then(setUser);

        async function fetchData() {
            if (!id) return;
            try {
                const [productRes, workflowsRes, complianceRes, deploymentRes, specificationsRes] = await Promise.all([
                    fetch(`/api/products/${id}`),
                    fetch('/api/workflows'),
                    fetch('/api/compliance-checks'),
                    fetch('/api/deployment-types'),
                    fetch('/api/specifications'),
                ]);

                if (!productRes.ok) throw new Error("Failed to fetch product details");
                
                const productData = await productRes.json();
                setProduct(productData);
                setFormState(productData);

                setWorkflows(await workflowsRes.json());
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };
    
    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormState(prev => ({ ...prev, [id]: checked }));
    };

    const handleSelectChange = (id: string, value: string) => {
        const selectedItem = (id === 'default_workflow' ? workflows : deploymentTypes).find(item => item.id === value);
        setFormState(prev => ({ ...prev, [id]: selectedItem ? { id: selectedItem.id, name: selectedItem.name } : undefined }));
    };
    
    const handleRadioChange = (value: string) => {
        const selectedType = deploymentTypes.find(item => item._id === value);
         setFormState(prev => ({ ...prev, deployment_type: selectedType ? { id: selectedType._id, name: selectedType.name } : undefined }));
    };

    const handleMultiSelectChange = (field: keyof Product, selectedItems: { id: string; name: string; }[]) => {
        setFormState(prev => ({ ...prev, [field]: selectedItems }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required for auditing.' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Product updated successfully.' });
                router.push('/products');
                router.refresh();
            } else {
                 const errorData = await response.json();
                 toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to update product.' });
            }
        } catch (error) {
            console.error("Failed to update product", error);
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    }

    if (loading && !product) {
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

    const renderMultiSelect = (
        fieldName: 'custom_workflows' | 'compliance_checks' | 'specifications',
        allOptions: SelectOption[]
    ) => {
        const chosenItems = (formState[fieldName] || []) as { id: string; name: string; }[];
        const chosenIds = new Set(chosenItems.map(item => item.id));

        const available: Option[] = allOptions
            .filter(opt => !chosenIds.has(opt._id))
            .map(opt => ({ id: opt._id, label: opt.name }));

        const chosen: Option[] = chosenItems.map(item => ({ id: item.id, label: item.name }));

        const moveItems = (ids: string[], source: Option[], dest: Option[]) => {
            const itemsToMove = source.filter(item => ids.includes(item.id));
            const newDest = [...dest, ...itemsToMove];
            const newDestAsProductField = newDest.map(i => ({ id: i.id, name: i.label }));
            handleMultiSelectChange(fieldName, newDestAsProductField);
        };
        
        const moveAll = (source: Option[], dest: Option[]) => {
            const newDest = [...dest, ...source];
            const newDestAsProductField = newDest.map(i => ({ id: i.id, name: i.label }));
            handleMultiSelectChange(fieldName, newDestAsProductField);
        };

        return (
            <MultiSelectListBox
                available={available}
                chosen={chosen}
                onMoveToChosen={(ids) => moveItems(ids, available, chosen)}
                onMoveToAvailable={(ids) => {
                     const newChosen = chosen.filter(item => !ids.includes(item.id));
                     handleMultiSelectChange(fieldName, newChosen.map(i => ({id: i.id, name: i.label})))
                }}
                onMoveAllToChosen={() => moveAll(available, chosen)}
                onMoveAllToAvailable={() => handleMultiSelectChange(fieldName, [])}
            />
        );
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Update Product: {product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Part 1 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input id="name" value={formState.name || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner">Owner Name *</Label>
                                    <Input id="owner" value={formState.owner || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner_email">Owner Email *</Label>
                                    <Input id="owner_email" type="email" value={formState.owner_email || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Product Image</Label>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="icon" type="button">
                                            <Camera className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="approval_needed" checked={formState.approval_needed || false} onCheckedChange={(checked) => handleCheckboxChange('approval_needed', !!checked)} />
                                    <Label htmlFor="approval_needed" className="font-normal">
                                        Product Level Deployment Approval is Needed
                                    </Label>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="default_workflow">Default Approval Workflow</Label>
                                    <Select value={formState.default_workflow?.id} onValueChange={(value) => handleSelectChange('default_workflow', value)}>
                                        <SelectTrigger id="default_workflow">
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
                                        value={formState.deployment_type?.id}
                                        onValueChange={handleRadioChange}
                                        className="flex flex-wrap items-center gap-4"
                                    >
                                        {deploymentTypes.map(type => (
                                            <div key={type._id} className="flex items-center space-x-2">
                                                <RadioGroupItem value={type._id} id={`deployment-type-${type.id}`} />
                                                <Label htmlFor={`deployment-type-${type.id}`} className="font-normal">{type.name}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="space-y-4">
                                     <div className="flex items-center gap-2">
                                        <Input id="git_repo" placeholder="Product Git Repo" value={formState.git_repo || ''} onChange={handleInputChange}/>
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="artifacts_repo" placeholder="Product Artifacts Repo" value={formState.artifacts_repo || ''} onChange={handleInputChange}/>
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="pipeline" placeholder="Product Pipeline" value={formState.pipeline || ''} onChange={handleInputChange}/>
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {formState.deployment_type?.id === 'Airgapped' && (
                                    <div>
                                        <h3 className="font-medium text-lg mb-2">Specifications</h3>
                                        <Label>Select Applicable HW Variants</Label>
                                         {renderMultiSelect('specifications', specifications)}
                                    </div>
                                )}
                                
                            </div>
                        </div>
                        <div className="space-y-2 mt-8">
                            <Label htmlFor="updateComment">Update Reason *</Label>
                            <Textarea 
                                id="updateComment" 
                                placeholder="Please provide a reason for this update for auditing purposes."
                                value={formState.updateComment || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2 pt-8">
                        <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                        <Button disabled={loading || !formState.updateComment}>
                             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            UPDATE PRODUCT
                        </Button>
                    </CardFooter>
                </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}

    

    
