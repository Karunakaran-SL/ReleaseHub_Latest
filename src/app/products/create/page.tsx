

'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '../../dashboard-layout';
import type { User, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Camera, Settings, Loader2 } from 'lucide-react';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';

interface SelectOption {
    _id: string;
    id: string;
    name: string;
}

type NewProductFormState = Omit<Product, '_id' | 'created_at' | 'updated_at'>;

const initialFormState: Partial<NewProductFormState> = {
    name: '',
    owner: '',
    owner_email: '',
    product_image: '',
    approval_needed: false,
    default_workflow: { id: '', name: '' },
    custom_workflows: [],
    compliance_checks: [],
    deployment_type: { id: 'Cloud', name: 'Cloud' },
    git_repo: '',
    artifacts_repo: '',
    pipeline: '',
    specifications: [],
};

export default function CreateProductPage() {
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState<Partial<NewProductFormState>>(initialFormState);

    // Options fetched from API
    const [allWorkflows, setAllWorkflows] = useState<Option[]>([]);
    const [allComplianceChecks, setAllComplianceChecks] = useState<Option[]>([]);
    const [allDeploymentTypes, setAllDeploymentTypes] = useState<Option[]>([]);
    const [allSpecifications, setAllSpecifications] = useState<Option[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            try {
                const [workflowsRes, complianceRes, deploymentRes, specificationsRes] = await Promise.all([
                    fetch('/api/workflows'),
                    fetch('/api/compliance-checks'),
                    fetch('/api/deployment-types'),
                    fetch('/api/specifications'),
                ]);
                
                const mapToOptions = (items: any[]): Option[] => items.map(item => ({ id: item._id, label: item.name }));

                setAllWorkflows(mapToOptions(await workflowsRes.json()));
                setAllComplianceChecks(mapToOptions(await complianceRes.json()));
                setAllDeploymentTypes(mapToOptions(await deploymentRes.json()));
                setAllSpecifications(mapToOptions(await specificationsRes.json()));

            } catch (error) {
                console.error("Failed to fetch data for form", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load necessary data for the form.'
                });
            }
        }
        fetchData();
    }, [toast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormState(prev => ({ ...prev, [id]: checked }));
    };

    const handleSelectChange = (field: 'default_workflow', value: string) => {
        const options = allWorkflows;
        const selected = options.find(opt => opt.id === value);
        if (selected) {
            setFormState(prev => ({ ...prev, [field]: { id: selected.id, name: selected.label } }));
        }
    };
    
    const handleRadioChange = (value: string) => {
        const selectedType = allDeploymentTypes.find(item => item.id === value);
        if (selectedType) {
            setFormState(prev => ({ ...prev, deployment_type: {id: selectedType.id, name: selectedType.label} }));
        }
    };
    
    const handleMultiSelectUpdate = useCallback((fieldName: keyof Pick<NewProductFormState, 'custom_workflows' | 'compliance_checks' | 'specifications'>, newChosenItems: {id: string, name: string}[]) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: newChosenItems,
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const productName = formState.name || 'NewProduct';
        const productId = productName.replace(/[^a-zA-Z0-9]/g, '');
        const imageUrl = formState.product_image || `https://picsum.photos/seed/${productId}/40/40`;

        const payload = {
            ...initialFormState,
            ...formState,
            product_image: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Product created successfully.' });
                router.push('/products');
                router.refresh();
            } else {
                const errorData = await response.json();
                console.error('Failed to create product:', errorData);
                toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to create product.' });
            }

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const renderMultiSelect = (
        fieldName: keyof Pick<NewProductFormState, 'custom_workflows' | 'compliance_checks' | 'specifications'>,
        allOptions: Option[]
    ) => {
        const chosenIds = new Set((formState[fieldName] || []).map(item => item.id));
        const available = allOptions.filter(opt => !chosenIds.has(opt.id));
        const chosen = allOptions.filter(opt => chosenIds.has(opt.id));

        const onMoveToChosen = (ids: string[]) => {
            const newChosen = [...(formState[fieldName] || []), ...available.filter(i => ids.includes(i.id)).map(i => ({id: i.id, name: i.label}))];
            handleMultiSelectUpdate(fieldName, newChosen);
        }

        const onMoveToAvailable = (ids: string[]) => {
            const newChosen = (formState[fieldName] || []).filter(i => !ids.includes(i.id));
            handleMultiSelectUpdate(fieldName, newChosen);
        }

        return (
            <MultiSelectListBox
                available={available}
                chosen={chosen}
                onMoveToChosen={onMoveToChosen}
                onMoveToAvailable={onMoveToAvailable}
                onMoveAllToChosen={() => handleMultiSelectUpdate(fieldName, allOptions.map(i => ({id: i.id, name: i.label})))}
                onMoveAllToAvailable={() => handleMultiSelectUpdate(fieldName, [])}
            />
        );
    }
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                 <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create a New Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Part 1 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner">Owner Name *</Label>
                                    <Input id="owner" value={formState.owner || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner_email">Owner Email *</Label>
                                    <Input id="owner_email" type="email" value={formState.owner_email || ''} onChange={handleInputChange} required/>
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
                                    <Checkbox 
                                        id="approval_needed"
                                        checked={formState.approval_needed}
                                        onCheckedChange={(checked) => handleCheckboxChange('approval_needed', !!checked)}
                                     />
                                    <Label htmlFor="approval_needed" className="font-normal">
                                        Product Level Deployment Approval is Needed
                                    </Label>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="default_workflow">Default Approval Workflow</Label>
                                    <Select onValueChange={(value) => handleSelectChange('default_workflow', value)}>
                                        <SelectTrigger id="default_workflow">
                                            <SelectValue placeholder="Select a default workflow" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allWorkflows.map(item => (
                                                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Custom Approval Workflow</Label>
                                    {renderMultiSelect('custom_workflows', allWorkflows)}
                                </div>
                            </div>

                            {/* Part 2 */}
                            <div className="space-y-6">
                                 <div>
                                    <Label>Select the compliance check</Label>
                                     {renderMultiSelect('compliance_checks', allComplianceChecks)}
                                </div>
                                <div className="space-y-2">
                                    <Label>Deployment Type</Label>
                                    <RadioGroup 
                                        value={formState.deployment_type?.id}
                                        onValueChange={handleRadioChange}
                                        className="flex flex-wrap items-center gap-4"
                                    >
                                        {allDeploymentTypes.map(type => (
                                            <div key={type.id} className="flex items-center space-x-2">
                                                <RadioGroupItem value={type.id} id={type.id} />
                                                <Label htmlFor={type.id} className="font-normal">{type.label}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="space-y-4">
                                     <div className="flex items-center gap-2">
                                        <Input id="git_repo" placeholder="Product Git Repo" value={formState.git_repo} onChange={handleInputChange} />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="artifacts_repo" placeholder="Product Artifacts Repo" value={formState.artifacts_repo} onChange={handleInputChange} />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="pipeline" placeholder="Product Pipeline" value={formState.pipeline} onChange={handleInputChange} />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {formState.deployment_type?.id === 'Airgapped' && (
                                    <div>
                                        <h3 className="font-medium text-lg mb-2">Specifications</h3>
                                        <Label>Select Applicable HW Variants</Label>
                                        {renderMultiSelect('specifications', allSpecifications)}
                                    </div>
                                )}
                                
                                <div className="space-y-4 pt-6">
                                     <div className="flex items-center gap-2">
                                        <Input id="deployment-storage" placeholder="Product Deployment Storage" />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="deployment-report" placeholder="Product Deployment Report" />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2 pt-8">
                        <Button variant="outline" onClick={() => router.back()} type="button">CANCEL</Button>
                        <Button variant="outline" type="button">VALIDATE</Button>
                        <Button type="submit" disabled={loading}>
                             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            CREATE PRODUCT
                        </Button>
                    </CardFooter>
                </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
