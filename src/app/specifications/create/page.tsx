
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface CustomField {
    key: string;
    value: string;
}

interface ServiceContract {
    _id: string;
    id: string;
    name: string;
}

interface SpecificationFormData {
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
    network_cards?: string; // Storing as comma-separated string
    plug_power_cords?: string; // Storing as comma-separated string
    custom_fields?: CustomField[];
}

export default function CreateSpecificationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    
    const [formState, setFormState] = useState<Partial<SpecificationFormData>>({
        custom_fields: [{ key: '', value: '' }]
    });

    const [serviceContracts, setServiceContracts] = useState<ServiceContract[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchServiceContracts() {
            try {
                const res = await fetch('/api/documents/service-contracts');
                if (!res.ok) throw new Error("Failed to fetch service contracts");
                setServiceContracts(await res.json());
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load service contracts.' });
            }
        }
        fetchServiceContracts();
    }, [toast]);

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: keyof SpecificationFormData, value: string) => {
        const options = field === 'hw_type' ? hwTypes 
                      : field === 'hypervisor' ? hypervisors 
                      : field === 'service_contract_type' ? serviceContracts 
                      : [];

        const selectedOption = options.find(opt => opt.id === value);

        if (selectedOption) {
             setFormState(prev => ({ ...prev, [field]: { id: value, name: selectedOption.name } }));
        } else if (field === 'vendor') {
             setFormState(prev => ({ ...prev, vendor: value }));
        }
    };
    
    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newFields = [...(formState.custom_fields || [])];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const addCustomField = () => {
        setFormState(prev => ({ ...prev, custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }]}));
    };

    const removeCustomField = (index: number) => {
        const newFields = (formState.custom_fields || []).filter((_, i) => i !== index);
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const imageName = formState.name?.replace(/\s+/g, '') || 'newSpec';
        const imageUrl = formState.image || `https://picsum.photos/seed/${imageName}/40/40`;

        const payload = {
            ...formState,
            image: imageUrl,
            network_cards: formState.network_cards ? formState.network_cards.split(',').map(name => ({ id: name.trim().replace(/\s+/g, '_'), name: name.trim() })) : [],
            plug_power_cords: formState.plug_power_cords ? formState.plug_power_cords.split(',').map(name => ({ id: name.trim().replace(/\s+/g, '_'), name: name.trim() })) : [],
            total_cpu: Number(formState.total_cpu),
            memory_gb: Number(formState.memory_gb),
            storage_gb: Number(formState.storage_gb),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/specifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create specification');
            }
            toast({ title: 'Success', description: 'Specification created successfully.' });
            router.push('/specifications');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    // Dummy data for dropdowns
    const hwTypes = [{ id: 'Rack', name: 'Rack' }, { id: 'Blade', name: 'Blade' }];
    const vendors = ['Dell EMC', 'HPE', 'Cisco', 'Lenovo'];
    const hypervisors = [{ id: 'VMWareESXi', name: 'VMWare ESXi' }, { id: 'MicrosoftHyper-V', name: 'Microsoft Hyper-V' }];

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Specification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">HW Name *</Label>
                                        <Input id="name" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="hw_type">HW Type (Optional)</Label>
                                        <Select onValueChange={(value) => handleSelectChange('hw_type', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select HW Type" /></SelectTrigger>
                                            <SelectContent>
                                                {hwTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="vendor">Vendor *</Label>
                                        <Select onValueChange={(value) => handleSelectChange('vendor', value)} required>
                                            <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                            <SelectContent>
                                                {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="image">Image URL</Label>
                                        <Input id="image" onChange={handleInputChange} placeholder="https://picsum.photos/seed/..." />
                                    </div>
                                    <div>
                                        <Label htmlFor="service_contract_type">Service Contract Type</Label>
                                        <Select onValueChange={(value) => handleSelectChange('service_contract_type', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select Contract Type" /></SelectTrigger>
                                            <SelectContent>
                                                {serviceContracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div>
                                        <Label htmlFor="service-doc">Service Doc</Label>
                                        <Input id="service-doc" type="file" />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_point_email">Contact Point Email</Label>
                                        <Input id="contact_point_email" type="email" onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_point_phone">Contact Point Phone</Label>
                                        <Input id="contact_point_phone" type="tel" onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">HW Resources</h3>
                                    <div>
                                        <Label htmlFor="total_cpu">Total CPU *</Label>
                                        <Input id="total_cpu" type="number" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="memory_gb">Memory (GB) *</Label>
                                        <Input id="memory_gb" type="number" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="storage_gb">Storage (GB) *</Label>
                                        <Input id="storage_gb" type="number" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="network_cards">Network Cards type (comma-separated)</Label>
                                        <Input id="network_cards" onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="plug_power_cords">Plug/Power Cord Type</Label>
                                        <Input id="plug_power_cords" onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="hypervisor">Hypervisor</Label>
                                        <Select onValueChange={(value) => handleSelectChange('hypervisor', value)}>
                                            <SelectTrigger><SelectValue placeholder="N/A" /></SelectTrigger>
                                            <SelectContent>
                                                {hypervisors.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mt-6">Custom Fields</h3>
                                        <div className="space-y-2">
                                            {formState.custom_fields?.map((field, index) => (
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
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                CREATE
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
