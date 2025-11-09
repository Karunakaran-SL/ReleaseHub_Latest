
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Specification {
    _id: string;
    id: string;
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

interface FormState extends Partial<Specification> {
    updateComment?: string;
    network_cards: any;
    plug_power_cords: any;
}


export default function EditSpecificationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [specification, setSpecification] = useState<Specification | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<FormState>({network_cards: '', plug_power_cords: ''});
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    
    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        setLoading(true);
        fetch(`/api/specifications/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch specification');
                return res.json();
            })
            .then(data => {
                setSpecification(data);
                const networkCards = data.network_cards?.map((c: any) => c.name).join(', ') || '';
                const plugPowerCords = data.plug_power_cords?.map((p: any) => p.name).join(', ') || '';
                setFormState({...data, network_cards: networkCards, plug_power_cords: plugPowerCords, custom_fields: data.custom_fields || []});
            })
            .catch(err => {
                toast({ variant: 'destructive', title: 'Error', description: err.message });
                router.push('/specifications');
            })
            .finally(() => setLoading(false));
    }, [id, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: keyof Specification, value: string) => {
        // This is simplified. In a real app, you'd fetch the object or have it available.
        const name = (field === 'hw_type' ? hwTypes : field === 'vendor' ? vendors : field === 'service_contract_type' ? contractTypes : hypervisors).find(v => (typeof v === 'object' ? v.id : v) === value);
        const nameVal = typeof name === 'object' ? name.name : name;
        setFormState(prev => ({ ...prev, [field]: { id: value, name: nameVal } }));
    };
    
    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newFields = [...(formState.custom_fields || [])];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const addCustomField = () => {
        const newFields = [...(formState.custom_fields || []), { key: '', value: '' }];
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const removeCustomField = (index: number) => {
        const newFields = (formState.custom_fields || []).filter((_, i) => i !== index);
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required.' });
            return;
        }

        setLoading(true);
        // Transform comma-separated strings back to arrays of objects
        const payload = {
            ...formState,
            network_cards: typeof formState.network_cards === 'string' ? (formState.network_cards as string).split(',').map(name => ({ id: name.trim(), name: name.trim() })) : [],
            plug_power_cords: typeof formState.plug_power_cords === 'string' ? (formState.plug_power_cords as string).split(',').map(name => ({ id: name.trim(), name: name.trim() })) : [],
            total_cpu: Number(formState.total_cpu),
            memory_gb: Number(formState.memory_gb),
            storage_gb: Number(formState.storage_gb),
        };
        
        try {
            const response = await fetch(`/api/specifications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to update specification');
            toast({ title: 'Success', description: 'Specification updated successfully.' });
            router.push('/specifications');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    // Dummy data for dropdowns
    const hwTypes = [{ id: 'HWType_Rack', name: 'Rack' }, { id: 'HWType_Blade', name: 'Blade' }];
    const vendors = ['Dell EMC', 'HPE', 'Cisco', 'Lenovo'];
    const contractTypes = [{ id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus' }, { id: 'ServiceContract_Foundation_Care', name: 'Foundation Care' }];
    const hypervisors = [{ id: 'Hypervisor_VMWare_ESXi', name: 'VMWare ESXi' }, { id: 'Hypervisor_Microsoft_HyperV', name: 'Microsoft Hyper-V' }];

    if (loading && !specification) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Specification: {specification?.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">HW Name *</Label>
                                        <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="hw_type">HW Type (Optional)</Label>
                                        <Select value={formState.hw_type?.id} onValueChange={(value) => handleSelectChange('hw_type', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select HW Type" /></SelectTrigger>
                                            <SelectContent>
                                                {hwTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="vendor">Vendor *</Label>
                                        <Select value={formState.vendor} onValueChange={(value) => setFormState(prev => ({...prev, vendor: value}))} required>
                                            <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                            <SelectContent>
                                                {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div>
                                        <Label htmlFor="image">Image</Label>
                                        <Input id="image" type="file" />
                                    </div>
                                     <div>
                                        <Label htmlFor="service_contract_type">Service Contract Type</Label>
                                        <Select value={formState.service_contract_type?.id} onValueChange={(value) => handleSelectChange('service_contract_type', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select Contract Type" /></SelectTrigger>
                                            <SelectContent>
                                                {contractTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div>
                                        <Label htmlFor="service-doc">Service Doc</Label>
                                        <Input id="service-doc" type="file" />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_point_email">Contact Point Email</Label>
                                        <Input id="contact_point_email" type="email" value={formState.contact_point_email || ''} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_point_phone">Contact Point Phone</Label>
                                        <Input id="contact_point_phone" type="tel" value={formState.contact_point_phone || ''} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">HW Resources</h3>
                                    <div>
                                        <Label htmlFor="total_cpu">Total CPU *</Label>
                                        <Input id="total_cpu" type="number" value={formState.total_cpu || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="memory_gb">Memory (GB) *</Label>
                                        <Input id="memory_gb" type="number" value={formState.memory_gb || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="storage_gb">Storage (GB) *</Label>
                                        <Input id="storage_gb" type="number" value={formState.storage_gb || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="network_cards">Network Cards type (comma-separated)</Label>
                                        <Input id="network_cards" value={formState.network_cards as any || ''} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="plug_power_cords">Plug/Power Cord Type</Label>
                                        <Input id="plug_power_cords" value={formState.plug_power_cords as any || ''} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="hypervisor">Hypervisor</Label>
                                        <Select value={formState.hypervisor?.id} onValueChange={(value) => handleSelectChange('hypervisor', value)}>
                                            <SelectTrigger><SelectValue placeholder="N/A" /></SelectTrigger>
                                            <SelectContent>
                                                {hypervisors.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-lg mt-6">Custom Fields</h3>
                                        <div className="space-y-2">
                                            {(formState.custom_fields || []).map((field, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input placeholder="Key" value={field.key} onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)} />
                                                    <Input placeholder="Value" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} />
                                                    <Button variant="ghost" size="icon" onClick={() => removeCustomField(index)} type="button">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="link" size="sm" onClick={addCustomField} type="button" className="mt-2 px-0">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            ADD CUSTOM FIELD
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-8 md:col-span-2">
                                <Label htmlFor="updateComment">Update Reason *</Label>
                                <Textarea 
                                    id="updateComment" 
                                    placeholder="Please provide a reason for this update."
                                    value={formState.updateComment || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                            <Button type="submit" disabled={loading || !formState.updateComment}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                UPDATE
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
