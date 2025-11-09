
'use client';
import { useEffect, useState } from 'react';
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
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Camera, Settings } from 'lucide-react';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';

interface SelectOption {
    _id: string;
    id: string;
    name: string;
}

export default function CreateProductPage() {
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const [workflows, setWorkflows] = useState<SelectOption[]>([]);
    const [cmdbItems, setCmdbItems] = useState<SelectOption[]>([]);
    const [complianceChecks, setComplianceChecks] = useState<SelectOption[]>([]);
    const [deploymentTypes, setDeploymentTypes] = useState<SelectOption[]>([]);
    const [airgappedDetails, setAirgappedDetails] = useState<SelectOption[]>([]);
    const [selectedDeploymentType, setSelectedDeploymentType] = useState('Deployment_Airgapped');

    useEffect(() => {
        getUser().then(setUser);

        async function fetchData() {
            try {
                const [workflowsRes, cmdbRes, complianceRes, deploymentRes, airgappedRes] = await Promise.all([
                    fetch('/api/workflows'),
                    fetch('/api/cmdb'),
                    fetch('/api/compliance-checks'),
                    fetch('/api/deployment-types'),
                    fetch('/api/airgapped-details'),
                ]);
                
                setWorkflows(await workflowsRes.json());
                setCmdbItems(await cmdbRes.json());
                setComplianceChecks(await complianceRes.json());
                setDeploymentTypes(await deploymentRes.json());
                setAirgappedDetails(await airgappedRes.json());

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


    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create a New Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Part 1 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="product-name">Product Name *</Label>
                                    <Input id="product-name" placeholder="" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner-name">Owner Name *</Label>
                                    <Input id="owner-name" placeholder="" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner-email">Owner Email *</Label>
                                    <Input id="owner-email" type="email" placeholder="" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Product Image</Label>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="icon">
                                            <Camera className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="approval-needed" />
                                    <Label htmlFor="approval-needed" className="font-normal">
                                        Product Level Deployment Approval is Needed
                                    </Label>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="default-workflow">Default Approval Workflow</Label>
                                    <Select>
                                        <SelectTrigger id="default-workflow">
                                            <SelectValue placeholder="Select a default workflow" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workflows.map(item => (
                                                <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Custom Approval Workflow</Label>
                                    <MultiSelectListBox
                                        options={workflows.map(w => ({ id: w._id, label: w.name }))}
                                        onChange={(selected) => console.log('Selected Workflows:', selected)}
                                    />
                                </div>
                            </div>

                            {/* Part 2 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="cmdb">Select the CMDB</Label>
                                    <Select>
                                        <SelectTrigger id="cmdb">
                                            <SelectValue placeholder="Select the CMDB" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cmdbItems.map(item => (
                                                <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div>
                                    <Label>Select the compliance check</Label>
                                     <MultiSelectListBox
                                        options={complianceChecks.map(c => ({ id: c._id, label: c.name }))}
                                        onChange={(selected) => console.log('Selected Checks:', selected)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deployment Type</Label>
                                    <RadioGroup 
                                        value={selectedDeploymentType}
                                        onValueChange={setSelectedDeploymentType}
                                        className="flex flex-wrap items-center gap-4"
                                    >
                                        {deploymentTypes.map(type => (
                                            <div key={type.id} className="flex items-center space-x-2">
                                                <RadioGroupItem value={type.id} id={`deployment-type-${type.id}`} />
                                                <Label htmlFor={`deployment-type-${type.id}`} className="font-normal">{type.name}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="space-y-4">
                                     <div className="flex items-center gap-2">
                                        <Input id="git-repo" placeholder="Product Git Repo" />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="artifacts-repo" placeholder="Product Artifacts Repo" />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input id="pipeline" placeholder="Product Pipeline" />
                                        <Button variant="outline" size="icon" type="button">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {selectedDeploymentType === 'Deployment_Airgapped' && (
                                    <div>
                                        <h3 className="font-medium text-lg mb-2">Airgapped Details</h3>
                                        <Label>Select Applicable HW Variants</Label>
                                        <MultiSelectListBox
                                            options={airgappedDetails.map(d => ({ id: d._id, label: d.name }))}
                                            onChange={(selected) => console.log('Selected HW Variants:', selected)}
                                        />
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
                        </form>
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2 pt-8">
                        <Button variant="outline" onClick={() => router.back()}>CANCEL</Button>
                        <Button variant="outline">VALIDATE</Button>
                        <Button>CREATE PRODUCT</Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
