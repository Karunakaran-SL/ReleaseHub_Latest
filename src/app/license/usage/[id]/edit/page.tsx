
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, License, Product, CmdbTenant, CmdbComponent, CmdbApplication } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';
import { Textarea } from '@/components/ui/textarea';

type EditLicenseFormState = Partial<Omit<License, '_id'>> & { updateComment?: string };

export default function EditLicensePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<EditLicenseFormState>({});
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    // Data for MultiSelect
    const [products, setProducts] = useState<Product[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [components, setComponents] = useState<CmdbComponent[]>([]);
    const [applications, setApplications] = useState<CmdbApplication[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;

        async function fetchData() {
            setLoading(true);
            try {
                const [licenseRes, productsRes, tenantsRes, componentsRes, applicationsRes] = await Promise.all([
                    fetch(`/api/licenses/usage/${id}`),
                    fetch('/api/products'),
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications')
                ]);

                if (!licenseRes.ok) throw new Error("Failed to fetch license details");
                
                setFormState(await licenseRes.json());
                setProducts(await productsRes.json());
                setTenants(await tenantsRes.json());
                setComponents(await componentsRes.json());
                setApplications(await applicationsRes.json());

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
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

    const handleSelectChange = (field: 'type' | 'status', value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field: 'products' | 'tenants' | 'components' | 'apps', selectedIds: string[]) => {
        setFormState(prev => ({...prev, [field]: selectedIds}));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required.' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/licenses/usage/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update license.');
            }

            toast({ title: 'Success', description: 'License updated successfully.' });
            router.push('/license/usage');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    const renderMultiSelect = (
        fieldName: 'products' | 'tenants' | 'components' | 'apps',
        allOptions: { _id: string; name: string }[]
    ) => {
        const chosenIds = new Set(formState[fieldName] || []);
        const available: Option[] = allOptions.filter(opt => !chosenIds.has(opt._id)).map(opt => ({ id: opt._id, label: opt.name }));
        const chosen: Option[] = allOptions.filter(opt => chosenIds.has(opt._id)).map(opt => ({ id: opt._id, label: opt.name }));

        return (
            <MultiSelectListBox
                available={available}
                chosen={chosen}
                onMoveToChosen={(ids) => handleMultiSelectChange(fieldName, [...chosenIds, ...ids])}
                onMoveToAvailable={(ids) => handleMultiSelectChange(fieldName, [...chosenIds].filter(id => !ids.includes(id)))}
                onMoveAllToChosen={() => handleMultiSelectChange(fieldName, allOptions.map(o => o._id))}
                onMoveAllToAvailable={() => handleMultiSelectChange(fieldName, [])}
            />
        );
    };

    if (loading) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Update License: {formState.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">License Name *</Label>
                                    <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="owner">Owner *</Label>
                                    <Input id="owner" value={formState.owner || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select value={formState.type} onValueChange={(v) => handleSelectChange('type', v as any)} required>
                                        <SelectTrigger id="type"><SelectValue placeholder="Select type..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open-source">Open Source</SelectItem>
                                            <SelectItem value="proprietary">Proprietary</SelectItem>
                                            <SelectItem value="subscription">Subscription</SelectItem>
                                            <SelectItem value="perpetual">Perpetual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={formState.status} onValueChange={(v) => handleSelectChange('status', v as any)} required>
                                        <SelectTrigger id="status"><SelectValue placeholder="Select status..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="deprecated">Deprecated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-t pt-4">Usage / Impact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Products</Label>
                                        {renderMultiSelect('products', products)}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tenants</Label>
                                        {renderMultiSelect('tenants', tenants)}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Components</Label>
                                        {renderMultiSelect('components', components)}
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Applications</Label>
                                        {renderMultiSelect('apps', applications)}
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-2 pt-4">
                                <Label htmlFor="updateComment">Update Reason *</Label>
                                <Textarea id="updateComment" value={formState.updateComment || ''} onChange={handleInputChange} required />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update License
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
